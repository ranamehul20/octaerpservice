import { Countries } from "../models/Countries.js";
import {States } from "../models/States.js";
import { Cities } from "../models/Cities.js";
import { SocietyMst } from "../models/SocietyMst.js";
import { success, errors, validation } from "../utils/common.js";
import {generateBills} from "../controllers/MaintenanceController.js";
import { ChangeLogs } from "../models/ChangeLogs.js";

// Country listing Methods
export const listingCountries  = async (req, res, next) => {
  try {
    const country = await Countries.find();
    if (country) {
      // await session.commitTransaction();
      const countryList = [];
      country.forEach((item) => {
        countryList.push({
          id: item.id,
          name: item.name
        });
      });
      res
        .status(200)
        .json(success("Country fetched successfully",countryList, res.statusCode));
      return next();
    }
    res
      .status(500)
      .json(
        errors("Some error occurred while fetching Country", res.statusCode)
      );
    return next();
  } catch (error) {
    res.status(500).json(errors(error.message, res.statusCode));
    // await session.abortTransaction();
    next(error);
  }
};

// States listing Methods
export const listingStates  = async (req, res, next) => {
    try {
      console.log('Fetching states',req.query.country);
      const state = await States.find({country_id: req.query.country});
      if (state) {
        // await session.commitTransaction();
      const stateList = [];
      state.forEach((item) => {
        stateList.push({
          id: item.id,
          name: item.name
        });
      });
        res
          .status(200)
          .json(success("state fetched successfully",stateList, res.statusCode));
        return next();
      }
      res
        .status(500)
        .json(
          errors("Some error occurred while fetching state", res.statusCode)
        );
      return next();
    } catch (error) {
      res.status(500).json(errors(error.message, res.statusCode));
      // await session.abortTransaction();
      next(error);
    }
  };

  // city listing Methods
export const listingCities  = async (req, res, next) => {
    try {
      const city = await Cities.find({state_id: req.query.state});
      if (city) {
        // await session.commitTransaction();
        const cityList = [];
      city.forEach((item) => {
        cityList.push({
          id: item.id,
          name: item.name
        });
      });
        res
          .status(200)
          .json(success("city fetched successfully",cityList, res.statusCode));
        return next();
      }
      res
        .status(500)
        .json(
          errors("Some error occurred while fetching city", res.statusCode)
        );
      return next();
    } catch (error) {
      res.status(500).json(errors(error.message, res.statusCode));
      // await session.abortTransaction();
      next(error);
    }
  };

export const listingSociety = async (req, res) => {
  try { 
   const societies = await SocietyMst.find();
   if(societies) {
    const societyListing = [];
    societies.forEach((item) => {
      societyListing.push({
        _id: item._id,
        name: item.name
      });
    });
    res.status(200).json(success("Society Fetched Successfully",societyListing,res.statusCode));
   }else {
    res.status(500).json(errors("No Society Found",res.statusCode));
   }
  } catch (error) { res.status(500).json(errors(error.message,res.statusCode)); }
};

export const staticValues = (req, res) => {
  try {
    const societyTypes = {
      "1": "Tenament",
      "2" : "Flat"
    };
    const userTypes = { 
      // "1" : "Admin",
      "2" : "Chairman",
      "3" : "House Owner",
      "4" : "Tenant"
    };
    res.status(200).json(success("Static Values Fetched Successfully",{"societyTypes":societyTypes,"userTypes":userTypes},res.statusCode));
  } catch (err) { res.status(500).json(errors(err.message, res.statusCode)); }
};

export const testCron = (req, res) => {
  generateBills();
};