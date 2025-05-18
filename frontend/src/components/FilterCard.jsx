import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";

const filterData = [
  {
    filterType: "Job Type",
    key: "jobType",
    options: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"],
  },
  {
    filterType: "Level",
    key: "level",
    options: [
      "Intern",
      "Fresher",
      "Junior",
      "Middle",
      "Senior",
      "Manager",
      "Director",
    ],
  },
  {
    filterType: "Location",
    key: "location",
    options: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Others"],
  },
];

// Helper function to map API response locations to filter options
const mapLocationToFilter = (location) => {
  const predefinedLocations = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];
  return predefinedLocations.includes(location) ? location : "Others";
};

const FilterCard = () => {
  const [filters, setFilters] = useState({
    jobType: "",
    level: "",
    location: "",
  });
  const dispatch = useDispatch();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      jobType: "",
      level: "",
      location: "",
    });
  };

  useEffect(() => {
    dispatch(setSearchedQuery(filters));
  }, [filters, dispatch]);

  return (
    <div className="w-full bg-white rounded-md shadow-md z-20 h-[87%]">
      <div className="bg-green-800 p-4 rounded-md shadow-md z-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-lg text-white">Filter Jobs</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800 h-[30px] w-[55px]"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/3126/3126675.png"
              className="w-[100%] h-[100%] p-1"
              alt="clear"
            />
          </Button>
        </div>
      </div>
      {filterData.map((data) => (
        <div key={data.filterType} className="mb-4 p-4">
          <h2 className="font-semibold text-md mb-2">{data.filterType}</h2>
          <RadioGroup
            value={filters[data.key]}
            onValueChange={(value) => handleFilterChange(data.key, value)}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {data.options.map((item, idx) => {
                const displayValue = item === "Others" ? "Other Locations" : item;
                const itemId = `${data.key}-${idx}`;
                return (
                  <div key={itemId} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={item}
                      id={itemId}
                      className="text-green-800 accent-green-800"
                    />
                    <Label htmlFor={itemId}>{displayValue}</Label>
                  </div>
                );
              })}
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value=""
                  id={`${data.key}-clear`}
                  checked={filters[data.key] === ""}
                  className="text-green-800 accent-green-800"
                />
                <Label htmlFor={`${data.key}-clear`}>
                  Any {data.filterType}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      ))}
    </div>
  );
};

export { FilterCard, mapLocationToFilter };