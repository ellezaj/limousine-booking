import React from 'react';
import logo from '../../public/logo.webp';
export default function Header() {
    return (
        <header className="sticky top-0 z-40 bg-[#232323] text-white py-6 shadow-lg">
            <div className="px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <a href="#" className="text-2xl font-semibold">
                        {logo && <img src={logo} alt="Boundless Limousine Logo" className="h-12 mb-2" />}
                    </a>
                </div>
            </div>
        </header>
    );
}
