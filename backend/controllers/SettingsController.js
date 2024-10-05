import { Countries } from "../models/Countries.js";
import {States } from "../models/States.js";
import { Cities } from "../models/Cities.js";
import { SocietyMst } from "../models/SocietyMst.js";
import { success, errors, validation } from "../utils/common.js";

// Country listing Methods
export const listingCountries  = async (req, res, next) => {
  try {
    const country = await Countries.find();
    if (country) {
      // await session.commitTransaction();
      res
        .status(200)
        .json(success("Country fetched successfully",country, res.statusCode));
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
        res
          .status(200)
          .json(success("state fetched successfully",state, res.statusCode));
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
        res
          .status(200)
          .json(success("city fetched successfully",city, res.statusCode));
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

export const listingSociety = (req, res) => {
  try { 
    SocietyMst.find()
     .then((society) => {
        if (!society) {
          return res.status(404).json(errors("Society not found",res.statusCode));
        }
        res.status(200).json(success("Society Fetched Successfully",society,res.statusCode));
      })
     .catch((err) => res.status(500).json(errors(err.message, res.statusCode)));
  } catch (error) { res.status(500).json(errors(error.message,res.statusCode)); }
};