import { Schema, model,ObjectId,Date } from "mongoose";
const timezoneSchema = new Schema({
  zoneName: { type: String, required: true },
  gmtOffset: { type: Number, required: true },
  gmtOffsetName: { type: String, required: true },
  abbreviation: { type: String, required: true },
  tzName: { type: String, required: true }
}, { _id: false }); // Disable auto-generated _id for this sub-document

const translationsSchema = new Schema({
  kr: { type: String },
  "pt-BR": { type: String },
  pt: { type: String },
  nl: { type: String },
  hr: { type: String },
  fa: { type: String },
  de: { type: String },
  es: { type: String },
  fr: { type: String },
  ja: { type: String },
  it: { type: String },
  cn: { type: String },
  tr: { type: String },
  ru: { type: String },
  uk: { type: String },
  pl: { type: String }
}, { _id: false });

const countrySchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  iso3: { type: String, required: true },
  iso2: { type: String, required: true },
  numeric_code: { type: String, required: true },
  phone_code: { type: String, required: true },
  capital: { type: String, required: true },
  currency: { type: String, required: true },
  currency_name: { type: String, required: true },
  currency_symbol: { type: String, required: true },
  tld: { type: String, required: true },
  native: { type: String, required: true },
  region: { type: String, required: true },
  region_id: { type: String, required: true },
  subregion: { type: String, required: true },
  subregion_id: { type: String, required: true },
  nationality: { type: String, required: true },
  timezones: [timezoneSchema],
  translations: translationsSchema,
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  emoji: { type: String, required: true },
  emojiU: { type: String, required: true }
}, { timestamps: true });


export const Countries = model('Country', countrySchema);
