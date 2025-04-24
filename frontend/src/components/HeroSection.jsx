import React from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../assets/banner_1.png'

const HeroSection = () => {
    const [query, setQuery] = React.useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/");
    };

    return (
        <div className='relative'>
            <div className='hidden md:block top-0 -mt-14 p-0 absolute object-cover -z-10'>
            <img src={bannerImage} alt='hero' className='w-[85%] ml-48' />
            </div>

            <div className='max-w-screen-2xl container mx-auto px-4 md:py-8 py-2'>
                <div className='grid my-32 md:grid-cols-2 gap-4 justify-center items-center'>
                    <div>
                        <h1 className='text-5xl font-bold text-primary mb-3 ml-32'>Find your job today!</h1>
                        <p className='text-lg text-black mb-8 ml-32'>Empowering you to find the perfect opportunity.</p>
                        {/* <button 
                            className='bg-[#087658] text-white py-3 px-12 rounded-md'
                        >
                            Get Started
                        </button> */}
                        <div className='flex w-[70%] shadow-lg border border-gray-200 pl-2 rounded-full items-center gap-4 mx-auto'>
                        <input
                            type="text"
                            placeholder='Find your dream jobs'
                            onChange={(e) => setQuery(e.target.value)}
                            className='outline-none border-none w-full'
                        />
                        <Button onClick={searchJobHandler} className="rounded-r-full bg-[#087658]">
                            <Search className='h-5 w-5' />
                        </Button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;