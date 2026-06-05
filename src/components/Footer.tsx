import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-[#232323] text-slate-300 py-5">
            <div className="px-6 grid gap-6 md:grid-cols-2">
                <div>
                    <p className="text-lg font-semibold text-white">Fullstack Developer Skills Test</p>
                </div>
                <div className="text-sm text-right leading-5">
                    <p>© 2026 Jazelle Mae Toledo-De Guzman</p>
                    <p><a href="mailto:tjazellemae@gmail.com" className="hover:text-white">tjazellemae@gmail.com</a></p>
                </div>
            </div>
        </footer>
    );
}
