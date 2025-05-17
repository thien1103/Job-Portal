import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

const topBrands = [
  {
    name: 'Ngân Hàng Thương Mại Cổ Phần An Bình',
    logo: 'https://abbank.vn/uploads/images/2021/07/30/thumbnail-logo-abbank.png',
  },
  {
    name: 'Công Ty Cổ Phần TPI Land',
    logo: 'https://images.glints.com/unsafe/glints-dashboard.oss-ap-southeast-1.aliyuncs.com/company-logo/82dea9ac3dcc8efeaac9aa8f416cd297.png',
  },
  {
    name: 'Công Ty TNHH Giải Pháp Công Nghệ TMA Solutions',
    logo: 'https://www.tma.vn/favicon.ico',
  },
  {
    name: 'Công Ty Cổ Phần Đầu tư BĐS Hưng Thịnh',
    logo: 'https://batdongsanhungthinh.com.vn/wp-content/uploads/2017/03/logo-hung-thinh-corp-4.6.2020.jpg',
  },
  {
    name: 'Công Ty TNHH Jinyu (Việt Nam)',
    logo: 'https://ceca.tdtu.edu.vn/sites/alumni/files/course/image005-e1611313938964_0.png',
  },
  {
    name: 'Công ty TNHH Khu Du Lịch Vịnh Hạ Long',
    logo: 'https://lh3.googleusercontent.com/proxy/1vGtOgp4vJvqDwVXS4Y_9ZG0bNHuU6DXqmZJWPJ6-fmrMLGDcb8bs54GGAJ81qQeeXjlDmz0GDKRbdp5Q6IV4i4lMW32AS5QM3uOYZpThyWriYuKHc5UDuNJDohiiA',
  },
  {
    name: 'Công Ty Cổ Phần Công Nghệ FireGroup.',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEBYrD822Ex1Q/company-logo_200_200/company-logo_200_200/0/1668492737091/firegrouptechnology_logo?e=2147483647&v=beta&t=KeRgvzsoUINeQnPRzWd9u4CAJnSCb2s15lBs_ssprWU',
  },
  {
    name: 'Công Ty TNHH Daesang Việt Nam',
    logo: 'https://www.daesang.com/en/m/asset/images/sub/pr/brochure_cover.png',
  },
];

const TopBrands = () => {
  return (
    <div className="w-full bg-white py-10 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center mb-6">
        <h2 className="text-4xl font-bold text-[#087658]">Top</h2>
          <h2 className="ml-2 text-4xl font-bold">Recruiter</h2>
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {topBrands.map((brand, index) => (
              <CarouselItem
                key={index}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <div className="bg-white rounded-lg shadow text-center p-4 mx-2 h-[180px] flex flex-col justify-between">
                  <div className="h-[64px] flex items-center justify-center mb-2">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-16 object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {brand.name}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default TopBrands;
