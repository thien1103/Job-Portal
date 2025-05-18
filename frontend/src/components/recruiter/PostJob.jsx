import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "", // Will store the raw number as a string (e.g., "5000000")
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        deadline: "",
        benefits: "", // Will store the raw input (e.g., "Parking Free, Free Laptop")
        level: "",
        customLocation: "", // For "Other" input below dropdown
    });
    const [isCustomLocation, setIsCustomLocation] = useState(false);
    const [displaySalary, setDisplaySalary] = useState(""); // For formatted display (e.g., "5,000,000")
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        if (name === 'salary') {
            const rawValue = value.replace(/[^0-9]/g, '');
            setInput({ ...input, salary: rawValue });
            const formattedValue = rawValue ? Number(rawValue).toLocaleString('en-US') : '';
            setDisplaySalary(formattedValue);
        } else if (name === 'customLocation') {
            setInput({ ...input, customLocation: value });
        } else {
            setInput({ ...input, [name]: value });
        }
    };

    const selectChangeHandler = (value) => {
        if (value === 'Other') {
            setIsCustomLocation(true);
            setInput({ ...input, location: '', customLocation: '' });
        } else {
            setIsCustomLocation(false);
            setInput({ ...input, location: value, customLocation: '' });
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const defaultCompanyId = companies.length > 0 ? companies[0]._id : "";
        const finalLocation = isCustomLocation ? input.customLocation : input.location;

        const formattedInput = {
            ...input,
            location: finalLocation || "",
            description: input.description ? input.description.split('\n').map(line => line.trim()).filter(line => line) : [],
            requirements: input.requirements ? input.requirements.split('\n').map(line => line.trim()).filter(line => line) : [],
            benefits: input.benefits ? input.benefits.split(',').map(item => item.trim()).filter(item => item) : [],
            salary: Number(input.salary) || 0,
            experience: Number(input.experience) || 0,
            position: Number(input.position) || 0,
            companyId: defaultCompanyId,
        };

        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, formattedInput, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/recruiter/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-2' style={{ gridTemplateColumns: '1fr 1fr' }}>
    {/* Cột trái */}
    <div className="space-y-2">
        <div>
            <Label>Title</Label>
            <Input
                type="text"
                name="title"
                value={input.title}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                placeholder="Enter title here"
            />
        </div>
        <div>
            <Label>Description (Separate lines with Enter)</Label>
            <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                placeholder="Enter each description point on a new line"
            />
        </div>
        <div>
            <Label>Requirements (Separate lines with Enter)</Label>
            <Input
                type="text"
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                placeholder="Enter each requirement on a new line"
            />
        </div>
        <div>
            <Label>Salary (VND)</Label>
            <Input
                type="text"
                name="salary"
                value={displaySalary}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                placeholder="Ex: 20000000"
            />
        </div>
        <div>
            <Label>Location</Label>
            <Select onValueChange={selectChangeHandler} value={input.location}>
                <SelectTrigger className="w-full my-1">
                    <SelectValue placeholder="Select a Location" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                        <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                        <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            {isCustomLocation && (
                <div className="mt-2">
                    <Label>Other Location</Label>
                    <Input
                        type="text"
                        name="customLocation"
                        value={input.customLocation}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                        placeholder="Enter custom location"
                    />
                </div>
            )}
        </div>
    </div>

    {/* Cột phải */}
    <div className="space-y-2">
        <div>
            <Label>Job Type</Label>
            <Select onValueChange={(value) => setInput({...input, jobType: value})} value={input.jobType}>
                <SelectTrigger className="w-full my-1">
                    <SelectValue placeholder="Select a Job Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label>Experience (Years)</Label>
            <Input
                type="number"
                name="experience"
                value={input.experience}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                placeholder="0"
            />
        </div>
        <div>
            <Label>Number of Positions</Label>
            <Input
                type="number"
                name="position"
                value={input.position}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
            />
        </div>
        <div>
            <Label>Level</Label>
            <Select onValueChange={(value) => setInput({...input, level: value})} value={input.level}>
                <SelectTrigger className="w-full my-1">
                    <SelectValue placeholder="Select a Level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="Intern">Intern</SelectItem>
                        <SelectItem value="Fresher">Fresher</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Middle">Middle</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label>Deadline (YYYY-MM-DD)</Label>
            <Input
                type="date"
                name="deadline"
                value={input.deadline}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
            />
        </div>
        <div>
            <Label>Benefits (Separate with commas)</Label>
            <Input
                type="text"
                name="benefits"
                value={input.benefits}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                placeholder="Parking Free, Free Laptop"
            />
        </div>
    </div>
</div>
                    {loading ? (
                        <Button className="w-full my-4">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-4">Post New Job</Button>
                    )}
                    {companies.length === 0 && (
                        <p className='text-xs text-red-600 font-bold text-center my-3'>
                            *Please register a company first, before posting a job
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostJob;