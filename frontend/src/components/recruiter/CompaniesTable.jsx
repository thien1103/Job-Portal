import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CompaniesTable = () => {
  console.log("CompaniesTable rendering");
  const { companies = [], searchCompanyByText = "" } = useSelector(
    (store) => store.company
  );

  const navigate = useNavigate();

  // Compute filtered companies directly in render
  const filteredCompanies = Array.isArray(companies)
    ? companies.filter((company) => {
        if (!searchCompanyByText) return true;
        return company.name
          .toLowerCase()
          .includes(searchCompanyByText.toLowerCase());
      })
    : [];

  console.log("Filtered companies:", filteredCompanies);

  return (
    <div>
      <Table className="bg-white rounded-full shadow-sm">
        <TableCaption>A list of your recent registered companies</TableCaption>
        <TableHeader>
          <TableRow className="bg-white hover:bg-gray-50">
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCompanies.length === 0 ? (
            <TableRow className="bg-white">
              <TableCell colSpan={6} className="text-center bg-white">
                No Companies Found
              </TableCell>
            </TableRow>
          ) : (
            filteredCompanies.map((company) => (
              <TableRow key={company._id} className="bg-white hover:bg-gray-50">
                <TableCell className="bg-white">
                  <Avatar>
                    <AvatarImage src={company.logo} />
                  </Avatar>
                </TableCell>
                <TableCell className="bg-white">
                  <div
                    className="cursor-pointer underline text-blue-600"
                    onClick={() => navigate(`/company/${company._id}`)}
                  >
                    {company.name}
                  </div>
                </TableCell>
                <TableCell className="bg-white">{company.location}</TableCell>
                <TableCell className="bg-white">{company.contactInfo.phone}</TableCell>
                <TableCell className="bg-white">
                  {new Date(company.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right bg-white">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="w-32">
                      <div
                        onClick={() =>
                          navigate(`/recruiter/companies/${company._id}`)
                        }
                        className="flex items-center gap-2 w-fit cursor-pointer"
                      >
                        <Edit2 className="w-4" />
                        <span>Edit</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(CompaniesTable);