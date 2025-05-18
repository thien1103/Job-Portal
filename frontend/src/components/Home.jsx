import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { OurCompanies } from './OurCompanies';
import TopBrands from './TopBrand';


const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/recruiter/companies");
    }
  }, []);
  return (
    <div>
      <Navbar />
      <HeroSection />
      {/* <TopBrands/> */}
      <LatestJobs />
      <CategoryCarousel />
      <OurCompanies />
      <Footer />
    </div>
  )
}

export default Home