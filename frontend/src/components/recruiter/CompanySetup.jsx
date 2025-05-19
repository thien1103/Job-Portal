import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/Textarea"; // Fixed import case (Textarea to textarea)
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById";

const CompanySetup = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleCompany } = useSelector((store) => store.company);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    file: null,
  });

  useGetCompanyById(params.id);

  useEffect(() => {
    console.log("singleCompany updated:", singleCompany);
    if (singleCompany) {
      setInput({
        name: singleCompany.name || "",
        description: singleCompany.description || "",
        website: singleCompany.website || "",
        location: singleCompany.location || "",
        file: singleCompany.file || null,
      });
      setIsFetching(false);
    } else {
      setIsFetching(true);
    }
  }, [singleCompany]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      setLoading(true);
      console.log("api ", `${COMPANY_API_END_POINT}/update/${params.id}`);
      const res = await axios.patch(
        `${COMPANY_API_END_POINT}/update/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/recruiter/companies");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading company data...</span>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto my-4 px-4">
        <form onSubmit={submitHandler}>
          <div className="flex items-center gap-5 p-8">
            <Button
              onClick={() => navigate("/recruiter/companies")}
              variant="outline"
              className="flex items-center gap-2 text-gray-500 font-semibold"
            >
              <ArrowLeft />
              <span>Back</span>
            </Button>
            <h1 className="font-bold text-xl">Update Company</h1>
          </div>
          <div className="space-y-6">
            {/* Company Name and Location in one row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={input.name}
                  onChange={changeEventHandler}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  type="text"
                  name="location"
                  value={input.location}
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            {/* Website */}
            <div>
              <Label>Website</Label>
              <Input
                type="text"
                name="website"
                value={input.website}
                onChange={changeEventHandler}
              />
            </div>
            {/* Description (full width) */}
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                rows={4}
                placeholder="Enter company description"
              />
            </div>
            {/* Logo */}
            <div>
              <Label>Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={changeFileHandler}
              />
            </div>
          </div>
          {loading ? (
            <Button className="w-full mt-6" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full mt-6">
              Update
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;