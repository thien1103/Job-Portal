import React from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import bannerImage from "../assets/banner_1.png";

const HeroSection = () => {
  const [query, setQuery] = React.useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <div className="relative min-h-[80vh] bg-white/80 backdrop-blur-md p-4">
        {/* Background Image */}
        <div className="hidden md:block absolute inset-0 -z-10 overflow-hidden">
          <img
            src={bannerImage}
            alt="hero"
            className="w-full h-full object-cover"
            onError={() => console.error("Failed to load banner image")}
          />
        </div>

        {/* Foreground Content */}
        <div className="max-w-screen-2xl container mx-auto px-4 md:py-8 py-2 relative z-10">
          <div className="grid my-32 md:grid-cols-2 gap-4 items-center">
            <div className="md:pl-[40px]"> {/* Shift content slightly left */}
              <h1 className="text-5xl font-bold text-primary mb-3 drop-shadow-md">
                Find your job today!
              </h1>
              <p className="text-lg text-black mb-8 drop-shadow-md">
                Empowering you to find the perfect opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[20px] bg-white" />
    </>
  );
};

export default HeroSection;
