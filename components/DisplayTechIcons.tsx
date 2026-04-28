"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getTechLogos } from "@/lib/utils";

type TechIcon = {
    tech: string;
    url: string;
};

type TechIconProps = {
    techStack: string[];
};

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
    const [icons, setIcons] = useState<TechIcon[]>([]);

    useEffect(() => {
        const fetchIcons = async () => {
            if (!techStack?.length) return; // avoid unnecessary fetch
            try {
                const data = await getTechLogos(techStack);
                setIcons(data.slice(0, 3)); // only top 3 icons
            } catch (err) {
                console.error("❌ Error fetching tech logos:", err);
            }
        };

        fetchIcons();
    }, [techStack]);

    if (!icons.length) {
        return (
            <div className="text-xs text-gray-400 italic">
                No tech stack specified
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-2">
            {icons.map(({ tech, url }) => (
                <div
                    key={tech}
                    className="relative group bg-white/90 rounded-full w-10 h-10 p-2 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                >
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {tech}
          </span>

                    <Image
                        src={url}
                        alt={tech}
                        width={24}
                        height={24}
                        className="object-contain"
                    />
                </div>
            ))}
        </div>
    );
};

export default DisplayTechIcons;
