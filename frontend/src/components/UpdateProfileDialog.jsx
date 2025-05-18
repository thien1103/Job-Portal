import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [cvFile, setCvFile] = useState(null); // State for CV file
    const { user } = useSelector(store => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(", ") || "",
    });

    const [experiences, setExperiences] = useState(user?.profile?.experiences || []);
    const [educations, setEducations] = useState(user?.profile?.educations || []);

    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };


    const submitHandler = async (e) => {
        e.preventDefault();

        const dataToSubmit = {
            fuller: input.fullname,
            email: input.email,
            phoneNumber: input.phoneNumber,
            bio: input.bio,
            skills: input.skills.split(",").map(skill => skill.trim()),
            experiences,
            educations,
        };

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, dataToSubmit, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }

        setOpen(false);
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" onInteractOutside={() => setOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Update Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='grid gap-4 py-4'>
                            {/* Name */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="fullname" className="text-right">Name</Label>
                                <Input id="fullname" name="fullname" type="text" value={input.fullname} onChange={changeEventHandler} className="col-span-3" />
                            </div>

                            {/* Email */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" name="email" type="email" value={input.email} onChange={changeEventHandler} className="col-span-3" />
                            </div>

                            {/* Phone Number */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
                                <Input id="phoneNumber" name="phoneNumber" value={input.phoneNumber} onChange={changeEventHandler} className="col-span-3" />
                            </div>

                            {/* Bio */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="bio" className="text-right">Bio</Label>
                                <Input id="bio" name="bio" value={input.bio} onChange={changeEventHandler} className="col-span-3" />
                            </div>

                            {/* Skills */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="skills" className="text-right">Skills</Label>
                                <Input id="skills" name="skills" value={input.skills} onChange={changeEventHandler} className="col-span-3" />
                            </div>

                           
                        </div>

                        <DialogFooter>
                            {loading ? (
                                <Button className="w-full my-4" disabled>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                                </Button>
                            ) : (
                                <Button type="submit" className="w-full my-4">Update</Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UpdateProfileDialog;