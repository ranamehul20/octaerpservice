import { SocietyMst } from "../models/SocietyMst.js";
import { success, errors, validation } from "../utils/common.js";
// Society Create Method
export const createSociety = async (req, res, next) => {
  const data = req.body;
  console.log(req.user._id);
  console.log("path", req.file.path);
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
        logo: req.file.path ?? "",
        currency: data.currency ?? "",
        registrationNumber: data.registrationNumber ?? "",
        bankDetails: data.bankDetails ?? "",
        bankName: data.bankName ?? "",
        bankBranch: data.bankBranch ?? "",
        bankAccountNumber: data.bankAccountNumber ?? "",
        bankIFSCCode: data.bankIFSCCode ?? "",
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
      res
       .status(200)
       .json(success("Society details fetched successfully", societyDetails, res.statusCode));
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
