import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/Textarea';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setSingleCompany, setLoading } from '@/redux/companySlice';
import { Loader2 } from 'lucide-react';

const CompanyCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [input, setInput] = useState({
        companyName: '',
        description: '',
        website: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
        file: '',
    });
    const [loading, setLocalLoading] = useState(false);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            setInput({ ...input, file: file });
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const trimmedCompanyName = input.companyName.trim();
        const trimmedDescription = input.description.trim();
        const trimmedWebsite = input.website.trim();
        const trimmedLocation = input.location.trim();
        const trimmedContactEmail = input.contactEmail.trim();
        const trimmedContactPhone = input.contactPhone.trim();

        // Blank field validations
        if (!trimmedCompanyName) {
            toast.error('Company name is required');
            return;
        }
        if (!trimmedDescription) {
            toast.error('Description is required');
            return;
        }
        if (!trimmedWebsite) {
            toast.error('Website is required');
            return;
        }
        if (!trimmedLocation) {
            toast.error('Location is required');
            return;
        }
        if (!trimmedContactEmail) {
            toast.error('Contact email is required');
            return;
        }
        if (!trimmedContactPhone) {
            toast.error('Contact phone is required');
            return;
        }
        if (!input.file) {
            toast.error('Company logo is required');
            return;
        }

        try {
            setLocalLoading(true);
            dispatch(setLoading(true));

            const formData = new FormData();
            formData.append('companyName', trimmedCompanyName);
            formData.append('description', trimmedDescription);
            formData.append('website', trimmedWebsite);
            formData.append('location', trimmedLocation);
            formData.append('contactEmail', trimmedContactEmail);
            formData.append('contactPhone', trimmedContactPhone);
            formData.append('file', input.file);

            // Debug: Log FormData contents
            console.log('Submitting FormData:');
            for (let pair of formData.entries()) {
                console.log(`Key: ${pair[0]}, Value: ${pair[1] instanceof File ? 'File' : pair[1]}`);
            }

            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, formData, {
                withCredentials: true,
            });

            console.log('Response:', res.data);

            if (res?.data?.success) {
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/recruiter/companies/${companyId}`);
            }
        } catch (error) {
            console.error('Request failed:', error);
            console.log('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Failed to register company. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex items-center justify-center max-w-7xl mx-auto">
                <form onSubmit={submitHandler} className="w-1/2 border border-gray-200 rounded-md p-4 my-10">
                    <h1 className="font-bold text-xl mb-5">Register Your Company</h1>

                    <div className="my-2">
                        <Label>Company Name</Label>
                        <Input
                            type="text"
                            name="companyName"
                            value={input.companyName}
                            onChange={changeEventHandler}
                            placeholder="JobHunt, Microsoft etc."
                        />
                    </div>

                    <div className="my-2">
                        <Label>Description</Label>
                        <Textarea
                                        name="description"
                                        value={input.description}
                                        onChange={changeEventHandler}
                                        rows={4}
                                        placeholder="Enter company description"
                                      />
                    </div>

                    <div className="my-2">
                        <Label>Website</Label>
                        <Input
                            type="url"
                            name="website"
                            value={input.website}
                            onChange={changeEventHandler}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="my-2">
                        <Label>Location</Label>
                        <Input
                            type="text"
                            name="location"
                            value={input.location}
                            onChange={changeEventHandler}
                            placeholder="Company address"
                        />
                    </div>

                    <div className="my-2">
                        <Label>Contact Email</Label>
                        <Input
                            type="email"
                            name="contactEmail"
                            value={input.contactEmail}
                            onChange={changeEventHandler}
                            placeholder="contact@example.com"
                        />
                    </div>

                    <div className="my-2">
                        <Label>Contact Phone</Label>
                        <Input
                            type="tel"
                            name="contactPhone"
                            value={input.contactPhone}
                            onChange={changeEventHandler}
                            placeholder="+1234567890"
                        />
                    </div>

                    <div className="my-2">
                        <Label>Company Logo</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={changeFileHandler}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2 my-4">
                        {loading ? (
                            <Button className="w-full">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-1/2"
                                    onClick={() => navigate("/recruiter/companies")}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="w-1/2">
                                    Continue
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyCreate;