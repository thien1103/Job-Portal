import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Contact, Mail, Globe, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom"; // Added missing import
import axios from "axios";
import { COMPANY_API_END_POINT } from "../utils/constant"; // Assuming this constant exists

const VisitCompanyPage = () => {
  const { companyId } = useParams(); // Now properly defined
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
            <span>{contactInfo.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{contactInfo.phone}</span>
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
          <h1 className="font-bold text-lg">Description</h1>
          <p className="text-gray-700 mt-2">{description}</p>
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
          <div className="flex items-center gap-3 my-2">
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitCompanyPage;