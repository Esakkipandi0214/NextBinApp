// // components/Sidebar.js
// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { FaBullhorn } from 'react-icons/fa';
// import { MdMenu } from 'react-icons/md';
// import { Building, LucideLayoutTemplate, Users2Icon } from 'lucide-react';
// import { TiThLarge } from 'react-icons/ti';
// import { HiHashtag } from 'react-icons/hi';
// import Image from 'next/image';

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const router = useRouter();
//   const currentPath = router.pathname;

//   const menuItems = [
//     { href: '/company', icon: <Building size={20} />, label: 'Company' },
//     { href: '/customer', icon: <Users2Icon size={20} />, label: 'Customers' },
//     { href: '/template', icon: <LucideLayoutTemplate size={20} />, label: 'Template' },
//     { href: '/broadcast', icon: <FaBullhorn size={20} />, label: 'Broadcast' },
//     { href: '/dailycode', icon: <HiHashtag size={20} />, label: 'Dailycode' },
//   ];

//   return (
//     <div className={h-screen border rounded-tr-3xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-40'}}>
//       <div className="flex flex-col items-center h-full mt-5">
//       <div className={flex w-1/2 items-center ${isCollapsed ? 'justify-center' : 'justify-between'}}>
//           {!isCollapsed && <Image src="/images.png" alt="Logo" className="w-7 h-7"  width={20}  height={20}/>}
//           {!isCollapsed && <h6 className="text-red-500 text-sm">KUBES</h6>}
//           <button onClick={() => setIsCollapsed(!isCollapsed)} className={isCollapsed ? 'mb-3' : 'ml-auto'}>
//             {isCollapsed ? (
//               <span className="text-red-500">
//                 <MdMenu size={24} />
//               </span>
//             ) : (
//               <span className="text-teal-400">
//                 <MdMenu size={24} />
//               </span>
//             )}
//           </button>
//         </div>
//         <h1 className={text-black font-bold text-sm mt-6 transition-all duration-300 ${isCollapsed ? 'self-center' : 'self-start ml-4'}}>
//           MENUS
//         </h1>

//         <nav className="flex flex-col space-y-4 w-full flex-grow items-center mt-2 p-3">
//           {menuItems.map((item) => (
//             <Link href={item.href} key={item.href} className="w-full">
//               <li
//                 className={`flex items-center p-2 pl-4 pr-4 cursor-pointer transition-all duration-300 ${
//                   currentPath === item.href ? 'border rounded-xl bg-red-400 text-white' : 'hover:text-red-500'
//                 } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
//               >
//                 <div className={mr-2 text-lg ${currentPath === item.href ? 'text-white' : ''}}>{item.icon}</div>
//                 {!isCollapsed && <span>{item.label}</span>}
//               </li>
//             </Link>
//           ))}
//         </nav>

//         <div className="mb-10 w-full">
//           <div className="flex items-center justify-center p-2 cursor-pointer">
//             <Image src="/images.png" alt="img" className="w-12 h-12 rounded-full" width={20}  height={20}/>
//             <div className="ml-2">
//               {!isCollapsed && <div className="text-sm">KUBE</div>}
//               {!isCollapsed && <div className="font-bold text-xs">Admin</div>}
//             </div>
//             <TiThLarge className="text-red-500 text-2xl ml-2" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;