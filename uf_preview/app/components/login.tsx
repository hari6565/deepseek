"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import DashBoard from "../utils/Image.png";
import LoginForm from "./LoginForm";
import { ArrowForward } from "../utils/svgApplications";

const Login = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(false)
    }
  }, [])

  return (
    <div className={`${loading ? "hidden" : ""} flex justify-between w-full h-screen bg-[#F4F4F6] overflow-hidden dark:bg-[#171717] transition-colors duration-700 ease`}>
      <div className="w-[30%] flex items-center justify-center  ">
        <LoginForm />
      </div>
      
      <div className={`flex flex-col justify-between w-[66%] h-[100%] pt-[3vw] gap-[2vw]`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mr-8">
            <div className="flex gap-1 items-center">
              <span className="w-[.46vw] h-[.46vw] rounded-full bg-[#0736C4]"></span>
              <p className="text-[0.93vw] leading-[2vh] font-bold text-[#0736C4] dark:text-white">
                What&apos;s New
              </p>
            </div>
            <p className="flex items-center text-[#0736C4] dark:text-white text-[0.72vw] font-medium leading-[1.5vh]">
              View all changes <ArrowForward />
            </p>
          </div>

          <p className="flex pt-3 dark:text-white text-[1.8vw] font-bold leading-[3.92vh]">
            Discover the New Torus 9
          </p>
          <p className="text-[0.93vw] leading-[2.31vh] w-[75%] mt-4 text-black/50 dark:text-[#FFFFFF]/50">
            Experience the all new Torus9 with an enhanced UI Intuitive
            appflow,newscreens a refreshed home and our newbrand new marketplace
            and templates Log in into Explore the nextlevel of productivity and
            innovations
          </p>
        </div>
        <Image
          className="w-[100%] mr-auto rounded-tl-[3.5%]  "
          src={DashBoard}
          alt="bankmaster"
        />
      </div>
    </div>
  );
};

export default Login;