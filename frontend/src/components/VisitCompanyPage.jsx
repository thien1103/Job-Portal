import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Contact, Mail, Globe, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../utils/constant";

const VisitCompanyPage = () => {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await axios.get(`${COMPANY_API_END_POINT}/${companyId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setCompanyData(res.data.company);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Company not found.</p>
      </div>
    );
  }

  const { name, description, logo, contactInfo, location, website, createdAt } = companyData;

  // Handle description: use array elements directly, no splitting by commas or newlines
  let descriptionLines = [];
  if (Array.isArray(description)) {
    descriptionLines = description
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim());
  } else if (typeof description === 'string' && description.trim()) {
    descriptionLines = [description.trim()];
  } else {
    console.warn(`Invalid description format for company ${companyId}:`, description);
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        {/* Company General Info */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={logo} alt="company-logo" />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{name}</h1>
              <p className="text-gray-500">{location}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="my-5">
          <h1 className="font-bold text-lg mb-2">Contact Information</h1>
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{contactInfo.email || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{contactInfo.phone || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Globe />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {website}
            </a>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl my-5 p-4">
          <h1 className="font-bold text-lg mb-2">Description</h1>
          {descriptionLines.length > 0 ? (
            <ul className="pl-4 list-disc text-gray-800">
              {descriptionLines.map((line, index) => (
                <li key={index} className="mb-1">{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mt-2">No description available</p>
          )}
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-2xl my-5 p-4">
          <h1 className="font-bold text-lg">Details</h1>
          <div className="flex items-center gap-3 my-2">
            <MapPin />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Calendar />
            <span>
              Created: {new Date(createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitCompanyPage;