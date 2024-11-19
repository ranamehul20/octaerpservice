import { SocietyMst } from "../models/SocietyMst.js";
import { success, errors, validation, dateConverter } from "../utils/common.js";
import { societyValidator } from "../utils/validator.js";
// Society Create Method
export const createSociety = async (req, res, next) => {
  const data = req.body;
  console.log(req.user._id);
  if(req.file){
    console.log("path", req.file.path);
  }
  const validator = await societyValidator(data);
  console.log(validator);
    if (!validator.isValid) {
      res
        .status(422)
        .json(validation(Object.values(validator.error).join(",")));
      return next();
    }
  try {
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
      settings: {
        logo: (req.file && req.file.path) ?? "",
        currency: data.currency ?? "",
        registrationNumber: data.registrationNumber ?? "",
        bankDetails: data.bankDetails ?? "",
        bankName: data.bankName ?? "",
        bankBranch: data.bankBranch ?? "",
        bankAccountNumber: data.bankAccountNumber ?? "",
        bankIFSCCode: data.bankIFSCCode ?? "",
        maintenanceAmount: data.maintenanceAmount?? 0,
        maintenanceFrequency: data.maintenanceFrequency?? "monthly",
        dueDay: data.dueDay?? 10,
        latePaymentPenalty: data.latePaymentPenalty?? 0,
      },
    });
    console.log(society);
    const societyDetails = await society.save();
    if (societyDetails) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("Society created successfully",{}, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(
        errors(
          "Some error occurred while adding society details",
          res.statusCode
        )
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// Society listing Methods
export const listingSociety = async (req, res, next) => {
  try {
    const societyDetails = await SocietyMst.find().populate('state').populate('city').populate('country');
    if (societyDetails) {
      // await session.commitTransaction();
      const society = [];
      societyDetails.forEach((item) => {
        society.push({
          _id: item._id,
          name: item.name,
          established: item.establishment ?? "-",
          type: item.type == 1 ? "Tenament" : item.type == 2 ? "Flat" : "",
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
    const originalData = await SocietyMst.findOne({ _id:req.params.id});
    // Save the original and updated values in the change log
    const log = new ChangeLog({
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
        name: data.name,
        street: data.street,
        locality: data.locality,
        state: data.state,
        city: data.city,
        country: data.country,
        zipCode: data.zipCode,
        type: data.type,
        settings: {
          currency: data.currency,
          registrationNumber: data.registrationNumber,
          bankDetails: data.bankDetails,
          bankName: data.bankName,
          bankBranch: data.bankBranch,
          bankAccountNumber: data.bankAccountNumber,
          bankIFSCCode: data.bankIFSCCode,
          logo: req.file ? req.file.path : data.logo,
          maintenanceAmount: data.maintenanceAmount?? 0,
          maintenanceFrequency: data.maintenanceFrequency?? "monthly",
          dueDay: data.dueDay?? 10,
          latePaymentPenalty: data.latePaymentPenalty?? 0,
        },
        updatedAt: new Date(),
        updatedBy: req.user._id,
      },
    });
    if (society) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("Society updated successfully",{}, res.statusCode));
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
        street: societyDetails.street,
        locality: societyDetails.locality,
        state: societyDetails.state,
        city: societyDetails.city,
        country: societyDetails.country,
        zipCode: societyDetails.zipCode,
        type: societyDetails.type,
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
