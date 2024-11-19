import { NoticeMst } from "../models/NoticeMst.js";
import { UserDetails } from "../models/UserDetailsModel.js";
import { noticeValidator } from "../utils/validator.js";
import { success, errors, validation } from "../utils/common.js";
import { NOTICE_DEFAULT,NOTICE_STATUS_PENDING,NOTICE_STATUS_SENT } from "../utils/constants.js";


export const create = async (req, res) => {
    try {
        const data = req.body;
        if(data.type==""){
            data.type=NOTICE_DEFAULT;
        }
        const details = await UserDetails.findOne({ userId: req.user._id});
        data.societyId = details.societyId;
        const validator = await noticeValidator(data);
        if (!validator.isValid) {
            res.status(422).json(validation(Object.values(validator.errors).join(",")));
            return next();
        }
        const notice = new NoticeMst({
            description: data.description,
            societyId: data.societyId,
            houseNumber: data.houseNumber ?? [],
            type: data.type,
            status: NOTICE_STATUS_PENDING,
            createdBy: req.user._id
        });
        await notice.save();
        res.status(200).json(success("Notice created successfully", {}, res.statusCode));
        return next();
    } catch (error) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
};

export const update = async (req, res) => {
    try {
        const data = req.body;
        const details = await UserDetails.findOne({ userId: req.user._id});
        data.societyId = details.societyId;
        const validator = await noticeValidator(data);
        if (!validator.isValid) {
            res.status(422).json(validation(Object.values(validator.errors).join(",")));
            return next();
        }
        const noticeData = {
            description: data.description,
            societyId: data.societyId,
            houseNumber: data.houseNumber ?? [],
            type: data.type,
            status: data.status,
            updatedBy: req.user._id
        }
        const notice = await NoticeMst.findByIdAndUpdate(req.params.id, noticeData, { new: true });
        if (!notice) {
            return res.status(404).json(errors("Notice not found"));
        }
        res.status(200).json(success("Notice updated successfully", notice, res.statusCode));
        return next();
    } catch (error) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
};

export const list = async (req, res) => {
    try {
        const notices = await NoticeMst.find({}).populate("societyId");
        if (!notices.length) {
            return res.status(404).json(errors("Notices not found"));
        }
        const noticeList= [];
        notices.forEach((notice) => {
            noticeList.push({
                _id: notice._id,
                description: notice.description,
                societyId: notice.societyId.name,
                type: notice.type == NOTICE_DEFAULT ? 'Default': 'Blockwise' ,
                status: notice.status,
                createdAt: notice.createdAt,
                updatedAt: notice.updatedAt
            })
        })
        res.status(200).json(success("Notices fetched successfully", noticeList, res.statusCode));
    } catch (error) {
        res.status(500).json(errors(error.message, res.statusCode));
        next(error);
    }
};