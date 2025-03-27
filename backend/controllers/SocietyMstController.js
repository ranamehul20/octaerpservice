import { SocietyMst } from "../models/SocietyMst.js";
import { success, errors, validation, dateConverter } from "../utils/common.js";
import { societyValidator } from "../utils/validator.js";
import { ChangeLogs } from "../models/ChangeLogs.js";
import Razorpay from 'razorpay';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
  key_secret: process.env.RAZORPAY_SECRET_KEY, // Replace with your Razorpay Key Secret
});
// Society Create Method
export const createSociety = async (req, res, next) => {
  const data = req.body;

  if (req.file) {
    console.log("path", req.file.path);
  }

  // Validate input data
  const validator = await societyValidator(data);
  if (!validator.isValid) {
    res
      .status(422)
      .json(validation(Object.values(validator.error).join(",")));
    return next();
  }

  try {
    // Create and save the society
    const society = new SocietyMst({
      name: data.name,
      street: data.street ?? "",
      locality: data.locality ?? "",
      state: data.state ?? "",
      city: data.city ?? "",
      country: data.country ?? "",
      zipCode: data.zipCode ?? "",
      type: data.type ?? 1,
      createdBy: req.user._id,
      contactPerson: {
        name: data.contactName ?? "",
        email: data.contactEmail ?? "",
        phone: data.contactPhone ?? "",
      },
      settings: {
        logo: req.file?.path ?? "",
        currency: data.currency ?? "",
        registrationNumber: data.registrationNumber ?? "",
        bankName: data.bankName ?? "",
        bankBranch: data.bankBranch ?? "",
        bankAccountNumber: data.bankAccountNumber ?? "",
        bankIFSCCode: data.bankIFSCCode ?? "",
        maintenanceAmount: data.maintenanceAmount ?? 0,
        maintenanceFrequency: data.maintenanceFrequency ?? "monthly",
        dueDay: data.dueDay ?? 10,
        latePaymentPenalty: data.latePaymentPenalty ?? 0,
        gstApplicable: data.gstApplicable ?? "no",
        gstPercentage: data.gstPercentage ?? 0
      },
    });

    const savedSociety = await society.save();

    if (!savedSociety) {
      throw new Error("Failed to save society details.");
    }

    // Populate references
    const populatedSociety = await SocietyMst.findById(savedSociety._id)
      .populate("createdBy")
      .populate({
        path: 'state',
        model: 'State',
        localField: 'state',         // Field in the current schema
        foreignField: 'id',         // Field in the referenced schema
        justOne: true,              // Return a single document
      }).populate({
        path: 'city',
        model: 'City',
        localField: 'city',         // Field in the current schema
        foreignField: 'id',         // Field in the referenced schema
        justOne: true,              // Return a single document
      }).populate({
        path: 'country',
        model: 'Country',
        localField: 'country',         // Field in the current schema
        foreignField: 'id',         // Field in the referenced schema
        justOne: true,              // Return a single document
      });

    let errMsg = "Society created successfully";
    // Razorpay API calls
    const accountResp = await createLinkedAccount(populatedSociety);
    if (!accountResp) {
      errMsg + " Failed to create Razorpay linked account.";
    } else {
      const stakeholderResp = await createStakeholder(accountResp.id, populatedSociety);
      if (!stakeholderResp) errMsg + " Failed to create Razorpay stakeholder.";
      const accountConfResp = await requestProductConfiguration(accountResp.id,populatedSociety);
      if (!accountConfResp) {
        errMsg + " Failed to request Razorpay product configuration.";
      } else {
        const updateConfResp = await updateProductConfiguration(accountResp.id,populatedSociety);
        if (!updateConfResp) errMsg + " Failed to update Razorpay product configuration.";
      }
    }


    res
      .status(200)
      .json(success("Society created successfully", populatedSociety, res.statusCode));
  } catch (error) {
    console.error("Error during society creation:", error.message);
    res
      .status(500)
      .json(errors(`Error: ${error.message}`, res.statusCode));
    next(error);
  }
};


// Society listing Methods
export const listingSociety = async (req, res, next) => {
  try {
    const societyDetails = await SocietyMst.find().populate({
      path: 'state',
      model: 'State',
      localField: 'state',         // Field in the current schema
      foreignField: 'id',         // Field in the referenced schema
      justOne: true,              // Return a single document
    }).populate({
      path: 'city',
      model: 'City',
      localField: 'city',         // Field in the current schema
      foreignField: 'id',         // Field in the referenced schema
      justOne: true,              // Return a single document
    }).populate({
      path: 'country',
      model: 'Country',
      localField: 'country',         // Field in the current schema
      foreignField: 'id',         // Field in the referenced schema
      justOne: true,              // Return a single document
    });
    if (societyDetails) {
      // await session.commitTransaction();
      const society = [];
      societyDetails.forEach((item) => {
        society.push({
          _id: item._id,
          name: item.name,
          established: item.establishment ?? "-",
          street: item.street,
          locality: item.locality,
          state: item.state,
          city: item.city,
          country: item.country,
          zipCode: item.zipCode,
          type: item.type,
          typeName: item.type == 1 ? "Tenament" : item.type == 2 ? "Flat" : "",
          contactName: item.contactPerson.name,
          contactEmail: item.contactPerson.email,
          contactPhone: item.contactPerson.phone,
          settings: {
            currency: item.settings.currency,
            registrationNumber: item.settings.registrationNumber,
            bankDetails: item.settings.bankDetails,
            bankName: item.settings.bankName,
            bankBranch: item.settings.bankBranch,
            bankAccountNumber: item.settings.bankAccountNumber,
            bankIFSCCode: item.settings.bankIFSCCode,
            logo: item.settings.logo,
            maintenanceAmount: item.settings.maintenanceAmount,
            maintenanceFrequency: item.settings.maintenanceFrequency,
            dueDay: item.settings.dueDay,
            latePaymentPenalty: item.settings.latePaymentPenalty,
            gstApplicable: item.settings.gstApplicable,
            gstPercentage: item.settings.gstPercentage
          },
        });
      });
      res
        .status(200)
        .json(success("Society created successfully", society, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(
        errors("Some error occurred while fetching societies", res.statusCode)
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// Society Update Method
export const updateSociety = async (req, res, next) => {
  const data = req.body;
  try {
    console.log(data);
    const originalData = await SocietyMst.findOne({ _id: req.params.id });
    // Save the original and updated values in the change log
    const log = new ChangeLogs({
      method: req.method,
      collectionName: 'SocietyMst',
      url: req.url,
      originalData: originalData.toObject(),
      updatedData: data
    });

    await log.save();
    console.log("Change log saved successfully");

    const society = await SocietyMst.findByIdAndUpdate(req.params.id, {
      $set: {
        name: data.name ?? originalData.name,
        street: data.street ?? originalData.street,
        locality: data.locality ?? originalData.locality,
        state: data.state ?? originalData.state,
        city: data.city ?? originalData.city,
        country: data.country ?? originalData.country,
        zipCode: data.zipCode ?? originalData.zipCode,
        type: data.type ?? originalData.type,
        contactPerson: {
          name: data.contactName ?? originalData.contactPerson.contactName,
          email: data.contactEmail ?? originalData.contactPerson.contactEmail,
          phone: data.contactPhone ?? originalData.contactPerson.contactPhone,
        },
        settings: {
          currency: data.currency ?? originalData.settings.currency,
          registrationNumber: data.registrationNumber ?? originalData.settings.registrationNumber,
          bankName: data.bankName ?? originalData.settings.bankName,
          bankBranch: data.bankBranch ?? originalData.settings.bankBranch,
          bankAccountNumber: data.bankAccountNumber ?? originalData.settings.bankAccountNumber,
          bankIFSCCode: data.bankIFSCCode ?? originalData.settings.bankIFSCCode,
          logo: req.file ? req.file.path : data.logo,
          maintenanceAmount: data.maintenanceAmount ?? 0,
          maintenanceFrequency: data.maintenanceFrequency ?? "monthly",
          dueDay: data.dueDay ?? 10,
          latePaymentPenalty: data.latePaymentPenalty ?? 0,
          gstApplicable: data.gstApplicable ?? "no",
          gstPercentage: data.gstPercentage ?? 0
        },
        updatedAt: new Date(),
        updatedBy: req.user._id,
      },
    });
    if (society) {
      // await session.commitTransaction();
      let errMsg = "Society updated successfully";
      console.log("razorpayData : ",society.razorpayData);
      let accountId= society.razorpayData && society.razorpayData.accountId ? society.razorpayData.accountId : '';
      // Razorpay API calls
      if (society.razorpayData && !society.razorpayData.accountCreated) {
        const accountResp = await createLinkedAccount(society);
        if (!accountResp) {
          errMsg + " Failed to create Razorpay linked account.";
        } else {
          accountId=accountResp.id;
        }
      }

      if (society.razorpayData && !society.razorpayData.stackholderCreated && accountId!="") {
        const stakeholderResp = await createStakeholder(accountId, society);
        if (!stakeholderResp){
          errMsg + " Failed to create Razorpay stakeholder.";
        } 
      }
      if (society.razorpayData && !society.razorpayData.accountConfigure && accountId!="") {
        const accountConfResp = await requestProductConfiguration(accountId,society);
        if (!accountConfResp){
          errMsg + " Failed to request Razorpay product configuration.";
        }
      }

      if (society.razorpayData && !society.razorpayData.updatedAccountConfigure && society.razorpayData.productId !="") {
        const updateConfResp = await updateProductConfiguration(accountId,society);
        if (!updateConfResp){
          errMsg + " Failed to update Razorpay product configuration.";
        } 
      }

      let details = {
        _id: society._id,
        name: society.name,
        established: item.establishment ?? "-",
        street: society.street,
        locality: society.locality,
        state: society.state,
        city: society.city,
        country: society.country,
        zipCode: society.zipCode,
        type: society.type,
        typeName: item.type == 1 ? "Tenament" : item.type == 2 ? "Flat" : "",
        contactName: society.contactPerson.name,
        contactEmail: society.contactPerson.email,
        contactPhone: society.contactPerson.phone,
        settings: {
          currency: society.settings.currency,
          registrationNumber: society.settings.registrationNumber,
          bankDetails: society.settings.bankDetails,
          bankName: society.settings.bankName,
          bankBranch: society.settings.bankBranch,
          bankAccountNumber: society.settings.bankAccountNumber,
          bankIFSCCode: society.settings.bankIFSCCode,
          logo: society.settings.logo,
          maintenanceAmount: society.settings.maintenanceAmount,
          maintenanceFrequency: society.settings.maintenanceFrequency,
          dueDay: society.settings.dueDay,
          latePaymentPenalty: society.settings.latePaymentPenalty,
          gstApplicable: society.settings.gstApplicable,
          gstPercentage: society.settings.gstPercentage
        },
      }

      res
        .status(200)
        .json(success("Society updated successfully", details, res.statusCode));
      return next();
    }
    res.status(500).json(errors("Error while updating details", res.statusCode));
    return next();
  } catch (err) {
    res.status(500).json(errors(err.message, res.statusCode));
    // await session.abortTransaction();
    next(err);
  }
};

// Society Detail Method
export const SocietyDetail = async (req, res, next) => {
  try {
    const societyDetails = await SocietyMst.findById(req.params.id);
    if (societyDetails) {
      // await session.commitTransaction();
      let details = {
        _id: societyDetails._id,
        name: societyDetails.name,
        established: item.establishment ?? "-",
        street: societyDetails.street,
        locality: societyDetails.locality,
        state: societyDetails.state,
        city: societyDetails.city,
        country: societyDetails.country,
        zipCode: societyDetails.zipCode,
        type: societyDetails.type,
        typeName: item.type == 1 ? "Tenament" : item.type == 2 ? "Flat" : "",
        contactName: societyDetails.contactPerson.name,
        contactEmail: societyDetails.contactPerson.email,
        contactPhone: societyDetails.contactPerson.phone,
        settings: {
          currency: societyDetails.settings.currency,
          registrationNumber: societyDetails.settings.registrationNumber,
          bankDetails: societyDetails.settings.bankDetails,
          bankName: societyDetails.settings.bankName,
          bankBranch: societyDetails.settings.bankBranch,
          bankAccountNumber: societyDetails.settings.bankAccountNumber,
          bankIFSCCode: societyDetails.settings.bankIFSCCode,
          logo: societyDetails.settings.logo,
          maintenanceAmount: societyDetails.settings.maintenanceAmount,
          maintenanceFrequency: societyDetails.settings.maintenanceFrequency,
          dueDay: societyDetails.settings.dueDay,
          latePaymentPenalty: societyDetails.settings.latePaymentPenalty,
          gstApplicable: societyDetails.settings.gstApplicable,
          gstPercentage: societyDetails.settings.gstPercentage
        },
      }
      res
        .status(200)
        .json(success("Society details fetched successfully", details, res.statusCode));
      return next();
    }
    res.status(404).json(errors("Society not found", res.statusCode));
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

async function createLinkedAccount(data) {
  try {
    const reqDetails = {
      email: data.contactPerson.email,
      phone: data.contactPerson.phone,
      type: "route",
      reference_id: "000" + data.id,
      legal_business_name: data.name,
      business_type: "society", // e.g., "individual" or "partnership"
      contact_name: data.contactPerson.name,
      profile: {
        category: "housing",
        subcategory: "rwa",
        addresses: {
          registered: {
            street1: data.street,
            street2: data.locality,
            city: data.city.name,
            state: data.state.name,
            postal_code: data.zipCode,
            country: data.country.iso2
          }
        }
      }
    };
    console.log(JSON.stringify(reqDetails));
    const response = await razorpayInstance.accounts.create(reqDetails);
    data.razorpayData.accountId = response.id;
    data.razorpayData.accountCreated = true;
    await data.save();
    console.log("Linked Account Created:", response);
    return response;
  } catch (error) {
    console.error("Error Creating Linked Account:", error);
    return null;
  }
}

async function createStakeholder(accountId, data) {
  try {
    const response = await razorpayInstance.stakeholders.create(accountId,{
      name: data.contactPerson.name,
      email: data.contactPerson.email
    });
    data.razorpayData.stackholderCreated = true;
    await data.save();
    console.log("Stakeholder Created:", response);
    return response;
  } catch (error) {
    console.error("Error Creating Stakeholder:", error);
    return null;
  }
}

async function requestProductConfiguration(accountId,data) {
  try {
    const response = await axios.post(
      `https://api.razorpay.com/v2/accounts/${accountId}/products`,
      {
        product_name: "route", // Specify the product name
        tnc_accepted: true,
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET_KEY,
        },
      }
    );
    data.razorpayData.productId=response.data.id;
    data.razorpayData.accountConfigure = true;
    await data.save();
    console.log("Product Configuration Requested:", response);
    return response;
  } catch (error) {
    console.error("Error Requesting Product Configuration:", error);
    return null;
  }
}

async function updateProductConfiguration(accountId, data) {
  try {
    const response = await axios.patch(
      `https://api.razorpay.com/v2/accounts/${accountId}/products/${data.razorpayData.productId}`,
      {
        settlements: {
          account_number: data.settings.bankAccountNumber,
          ifsc_code: data.settings.bankIFSCCode,
          beneficiary_name: data.contactPerson.name,
        },
        tnc_accepted: true,
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET_KEY,
        },
      }
    );
    data.razorpayData.updatedAccountConfigure = true;
    await data.save();
    console.log("Product Configuration Updated:", response);
    return response;
  } catch (error) {
    console.error("Error Updating Product Configuration:", error);
    return null;
  }
}

