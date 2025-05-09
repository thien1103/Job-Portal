import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../configs/cloudinary.js";
import { createError } from "../utils/appError.js";

export const registerCompany = async (req, res, next) => {
    try {
        const { companyName, description, website, location, contactEmail, contactPhone } = req.body;
        const userId = req.user._id;
        if (!companyName) {
            throw createError("Company name is required", 400);
        }

        let finalDescription;
        if (Array.isArray(description)) {
            finalDescription = description.map(item => item.trim()).filter(item => item).join("\n");
        } else if (typeof description === "string") {
            finalDescription = description;
        } else {
            throw createError("Description must be a string or array of strings", 400);
        }
        if (!finalDescription.trim()) {
            throw createError("Description cannot be empty", 400);
        }

        let companyExists = await Company.findOne({ name: companyName });
        if (companyExists) {
            throw createError("A company with this name already exists", 400);
        };

        const existingCompany = await Company.findOne({ userId });
        if (existingCompany) {
            throw createError("You can only register one company", 400);
        }

        let logo = "https://res.cloudinary.com/ddhjuylxz/image/upload/v1746631066/company_logo_default_w0lruy.png";
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            companyPhoto = cloudResponse.secure_url;
        };

        const company = await Company.create({
            name: companyName,
            userId,
            description: finalDescription,
            website,
            location,
            contactInfo: { email: contactEmail, phone: contactPhone },
            logo
        });

        const companyResponse = await Company.findById(company._id).select('-userId');
        const descriptionLines = companyResponse.description
            ? companyResponse.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(201).json({
            message: "Company registered successfully.",
            company: {
                ...companyResponse._doc,
                description: descriptionLines
            },
            success: true
        });
    } catch (error) {
        console.log("error registerCompany API: ", error);
        next(error);
    }
}
export const getCompany = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const company = await Company.findOne({ userId }).select('-userId');
        if (!company) {
            throw createError("Company not found", 404);
        }

        const descriptionLines = company.description
            ? company.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(200).json({
            company: {
                ...company._doc,
                description: descriptionLines
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getCompanyById = async (req, res, next) => {
    try {
        const companyId = req.params.id;

        const company = await Company.findById(companyId).select('-userId');
        if (!company) {
            throw createError("Company not found", 404);
        }

        const descriptionLines = company.description
            ? company.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(200).json({
            company: {
                ...company._doc,
                description: descriptionLines
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const updateCompany = async (req, res, next) => {
    try {
        const { name, description, website, location, contactEmail, contactPhone } = req.body;
        const userId = req.user._id;
        const companyId = req.params.id;

        const company = await Company.findById(companyId);
        if (!company) {
            throw createError("Company not found", 404);
        }

        if (company.userId.toString() !== userId.toString()) {
            throw createError("You are not authorized to update this company", 400);
        }

        if (name && name !== company.name) {
            const nameExists = await Company.findOne({ name, _id: { $ne: companyId } });
            if (nameExists) {
                throw createError("A company with this name already exists", 400);

            }
        }

        let finalDescription;
        if (description !== undefined) {
            if (Array.isArray(description)) {
                finalDescription = description.map(item => item.trim()).filter(item => item).join("\n");
            } else if (typeof description === "string") {
                finalDescription = description;
            } else {
                throw createError("Description must be a string or array of strings", 400);
            }
            if (!finalDescription.trim()) {
                throw createError("Description cannot be empty", 400);
            }
        }

        let logo = company.logo;
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }

        const updateData = {
            name,
            description: finalDescription,
            website,
            location,
            logo
        };

        if (contactEmail !== undefined || contactPhone !== undefined) {
            updateData.contactInfo = {
                email: contactEmail !== undefined ? contactEmail : company.contactInfo.email,
                phone: contactPhone !== undefined ? contactPhone : company.contactInfo.phone
            };
        }
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedCompany = await Company.findByIdAndUpdate(companyId, updateData, { new: true }).select('-userId');

        const descriptionLines = updatedCompany.description
            ? updatedCompany.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(200).json({
            message: "Company information updated",
            company: {
                ...updatedCompany._doc,
                description: descriptionLines,
                contactInfo: {
                    email: updatedCompany.contactInfo.email || "",
                    phone: updatedCompany.contactInfo.phone || ""
                }
            },
            success: true
        });

    } catch (error) {
        next(error);
    }
}