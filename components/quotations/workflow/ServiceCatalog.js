"use client";

const SERVICE_CATALOG = [
  {
    name: 'Website Design & Development',
    description: 'Responsive, modern website with up to 10 pages',
    rate: 45000,
  },
  {
    name: 'Mobile App Development',
    description: 'Cross-platform mobile app (iOS & Android)',
    rate: 120000,
  },
  {
    name: 'Logo & Brand Identity',
    description: 'Custom logo with brand guidelines',
    rate: 15000,
  },
  {
    name: 'Social Media Marketing',
    description: 'Monthly SMM management (3 platforms)',
    rate: 12000,
  },
  {
    name: 'SEO Services',
    description: 'On-page & off-page SEO optimization',
    rate: 8000,
  },
  {
    name: 'Content Writing',
    description: 'Website copy & blog posts (10 pages)',
    rate: 6000,
  },
  {
    name: 'UI/UX Design',
    description: 'Figma prototype & design system',
    rate: 25000,
  },
  {
    name: 'E-commerce Setup',
    description: 'Full online store with payment gateway',
    rate: 65000,
  },
];

export default function ServiceCatalog({ onAddService }) {
  return (
    <div className="bg-white border-2 border-[#1a1a2e] p-5">
      <h3 className="font-black uppercase tracking-widest text-sm text-[#1a1a2e] mb-4 border-b-2 border-[#e8b86d] pb-2">
        Quick Add from Service Catalog
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SERVICE_CATALOG.map((service) => (
          <button
            key={service.name}
            onClick={() => onAddService(service)}
            className="text-left p-2.5 border-2 border-dashed border-gray-300 hover:border-[#e8b86d] hover:bg-amber-50 transition-colors group"
          >
            <p className="text-xs font-bold text-gray-700 group-hover:text-[#1a1a2e] leading-tight">
              {service.name}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ₹{service.rate.toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
