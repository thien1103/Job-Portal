import {React, useState} from 'react';
import Navbar from './shared/Navbar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';


// Define categories for the career resources
const featuredArticles = [
  {
    title: "Resume Writing Tips",
    description: "Learn how to craft a professional resume that stands out.",
    link: "https://www.cake.me/resources/cv-thuc-tap",
    createdDate: "28/02/2025",
    image: "https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/images/006e1765-366d-47d1-9981-d0672da38c1c.png", // Add image URL here
  },
  {
    title: "Interview Preparation",
    description: "Get ready for interviews with common questions and tips.",
    link: "https://bohlerengineering.com/blog/bohler-cares/6-tips-for-interview-preparation/",
    createdDate: "06/04/2025",
    image: "https://careerconfidential.com/wp-content/uploads/2017/02/Acuity-Interview-Preparation-Infographic-Copy.jpg", // Add image URL here
  },
  {
    title: "Job Search Strategies",
    description: "Discover effective ways to search and apply for jobs.",
    link: "https://resumetrick.com/blog/job-search-tips.html",
    createdDate: "03/04/2025",
    image: "https://agencyvn.com/wp-content/uploads/2022/07/hinh-anh-tuyen-dung-2.jpg", // Add image URL here
  },
  {
    title: "LinkedIn Optimization",
    description: "Boost your LinkedIn profile to attract recruiters.",
    link: "https://www.linkedin.com/pulse/linkedin-profile-optimization-our-ultimate-guide-tips-nick-verity/",
    createdDate: "02/05/2025",
    image: "https://media.licdn.com/dms/image/v2/D4E12AQHyfHDfceV5vA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1683055110420?e=2147483647&v=beta&t=_IZBYpagKwdKpQKE61Yw_GIEPCr3RXGEBLYqiBx8EDo", // Add image URL here
  },
];

const careerGuidance = [
  {
    title: "Soft Skills Development",
    description: "Improve communication, teamwork, and problem-solving.",
    link: "https://www.husson.edu/online/blog/2024/09/tips-to-improve-soft-skills",
    createdDate: "27/02/2025",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr3J5KO6PLfSyZWPfy489PW70XfdcdT6QHBg&s", // Add image URL here
  },
  {
    title: "Portfolio Building",
    description: "Build a compelling portfolio to showcase your skills.",
    link: "https://www.frontendmentor.io/articles/portfoliobuilding-tips-for-aspiring-web-developers-A7qiP-_F-F",
    createdDate: "14/04/2025",
    image: "https://res.cloudinary.com/dz209s6jk/image/upload/f_auto,q_auto/Admin/ololguxrhts7agxrzvuy.jpg", // Add image URL here
  },
  {
    title: "Keyword Finding",
    description: "Find a perfect keyword to showcase your skills.",
    link: "https://mangools.com/blog/keyword-research/",
    createdDate: "11/03/2025",
    image: "https://mangools.com/blog/wp-content/uploads/2021/05/The-Keyword-Tripod-Rule.png", // Add image URL here
  },
  {
    title: "Keyword Research",
    description: "Understand how the keyword is becoming hot trend.",
    link: "https://outreachmonks.com/keyword-research-tips/",
    createdDate: "18/03/2025",
    image: "https://outreachmonks.com/wp-content/uploads/2023/04/Keyword-Research-Tips-2.jpg.webp", // Add image URL here
  },
  {
    title: "Keyword Tips",
    description: "Empower your keyword finding skill by tips and tricks from professionals.",
    link: "https://altosagency.com/blog/article/9-easy-keyword-research-tips-to-make-your-content-unmissable",
    createdDate: "30/01/2025",
    image: "https://cdn.prod.website-files.com/64baacfcb337b7364622226f/64fa37c1e3220872b6058075_Keyword%20Research%20Tips.png", // Add image URL here
  },
];

const industryKnowledge = [
  {
    title: "Tech Industry Trends 2023",
    description: "Stay updated with the latest trends in the tech industry.",
    link: "https://www.startus-insights.com/innovators-guide/knowledge-economy-trends/",
    createdDate: "11/01/2025",
    image: "https://storage.timviec365.vn/timviec365/pictures/images_12_2021/kien-thuc-chuyen-mon.jpg", // Add image URL here
  },
  {
    title: "Industry Guided For Begineers",
    description: "Here we will give you the best guidebook for your future career.",
    link: "https://huongnghiep.hocmai.vn/1-chuyen-nganh-la-gi-tranh-cam-bay-ve-nganh-va-chuyen-nganh-trong-tuyen-sinh/",
    createdDate: "27/02/2025",
    image: "https://huongnghiep.hocmai.vn/wp-content/uploads/2021/11/Ng%C3%A0nh-.jpg", // Add image URL here
  },
];

const CareerHandbook = () => {
    const navigate = useNavigate();
    const itemsPerPage = 3;
  
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [guidanceIndex, setGuidanceIndex] = useState(0);
    const [industryIndex, setIndustryIndex] = useState(0);
  
    const handleNavigate = (link) => {
      if (link.startsWith('http')) {
        window.location.href = link;
      } else {
        navigate(link);
      }
    };
  
    const renderCarouselSection = (title, data, currentIndex, setIndex) => (
      <section className="my-10">
        <h2
          className={`mb-4 ${
            ["Bài viết nổi bật", "Định hướng nghề nghiệp", "Kiến thức chuyên ngành"].includes(title)
              ? "text-3xl md:text-3xl font-extrabold text-green-600"
              : "text-xl font-semibold"
          }`}
        >
          {title}
        </h2>
        <div className='relative'>
          <div className='flex overflow-hidden gap-6'>
            {
              data.slice(currentIndex, currentIndex + itemsPerPage).map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between transition-transform transform hover:scale-105 min-w-[30%]">
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover mb-4 rounded-lg" />
                  <h3 className='text-lg font-semibold mb-2'>{item.title}</h3>
                  <p className='text-sm text-gray-600 mb-4'>{item.description}</p>
                  <p className='text-xs text-gray-500 mb-4'>{item.createdDate}</p>
                  <Button onClick={() => handleNavigate(item.link)} className="w-full h-10">
                    Read more
                  </Button>
                </div>
              ))
            }
          </div>
          <button onClick={() => setIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-green p-2 rounded-full">
            &#10094;
          </button>
          <button onClick={() => setIndex(prev => Math.min(data.length - itemsPerPage, prev + 1))}
            disabled={currentIndex >= data.length - itemsPerPage}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-green p-2 rounded-full">
            &#10095;
          </button>
        </div>
      </section>
    );
  
    return (
      <div>
        <Navbar />

        <div className="relative py-12 mb-10">
  <div className="relative max-w-7xl mx-auto px-4 text-center">
    <img
      src="https://img.freepik.com/premium-photo/horizontal-photo-minimal-office-desk-with-notebook-wireless-keyboard-copy-space-white-background_35674-8475.jpg"
      className="mx-auto w-full h-[400px] object-cover rounded-lg"
    />
    <div className="absolute inset-0 bg-opacity-50 flex flex-col justify-center items-center px-4 translate-x-2">
      <h1 className="text-3xl md:text-5xl font-extrabold text-green-500 mb-4">
      Career Guide
      </h1>
      <p className="text-green max-w-3xl mx-auto text-base text-green-900 md:text-lg">
      Explore useful information related to your desired profession. Share experiences and expertise to help you find a suitable job and develop yourself.
      </p>
    </div>
  </div>
</div>

        <div className='max-w-7xl mx-auto my-10 px-4'>
          {/* All sections rendered as carousels */}
          {renderCarouselSection("Featured Articles", featuredArticles, featuredIndex, setFeaturedIndex)}
          {renderCarouselSection("Career Guidance", careerGuidance, guidanceIndex, setGuidanceIndex)}
          {renderCarouselSection("Industry Knowledge", industryKnowledge, industryIndex, setIndustryIndex)}
        </div>
      </div>
    );
  };
  
  export default CareerHandbook;