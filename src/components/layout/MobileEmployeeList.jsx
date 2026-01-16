import React, { useEffect, useState } from "react";
import { Briefcase, Users } from "lucide-react";
import Endpoints from "../../context/endpoints";
import instId from "../../context/instituteId";

const MobileEmployeeList = ({ onViewAll, onFacultyClick }) => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch(
                `${Endpoints.baseURL}/admin/employee/fetch-public-employee/${instId}`
            );
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.employees || []);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <section className="py-6 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 sm:hidden">
            <div className="max-w-sm mx-auto px-4">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 px-2 text-center">
                    Our Expert Faculty
                </h2>

                {/* Grid View — 2 columns */}
                <div className="grid grid-cols-2 gap-4">
                    {employees.map((employee, index) => (
                        <div
                            key={index}
                            onClick={() => onFacultyClick?.(employee)}
                            className="bg-white rounded-xl p-4 shadow-md border cursor-pointer text-center hover:shadow-xl transition"
                        >
                            <div className="w-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-blue-200 to-purple-200 p-1 mb-3">
                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                    {employee.profile ? (
                                        <img
                                            src={Endpoints.mediaBaseUrl + employee.profile}
                                            alt="faculty"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                                            {employee.firstName?.[0]}
                                            {employee.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-sm font-bold leading-tight">
                                {employee.firstName} {employee.lastName}
                            </h3>

                            <div className="flex items-center justify-center gap-1 text-blue-600 text-xs my-1">
                                <Briefcase className="w-3 h-3" />
                                {employee.designation || "Faculty"}
                            </div>

                            {employee.courseIds?.length > 0 && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full font-semibold">
                                    {employee.courseIds.length} Courses
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {/* {onViewAll && (
                    <div className="text-center mt-6">
                        <button
                            onClick={onViewAll}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 mx-auto"
                        >
                            <Users className="w-4 h-4" /> View All Faculty
                        </button>
                    </div>
                )} */}
            </div>
        </section>
    );
};

export default MobileEmployeeList;
