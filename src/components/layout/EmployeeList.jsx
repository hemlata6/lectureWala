import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import { Camera, Heart, Star, X, ZoomIn, ChevronLeft, ChevronRight, Users, Award, Briefcase, Phone } from 'lucide-react';
import Endpoints from '../../context/endpoints';
import Network from '../../context/Network';
import instId from '../../context/instituteId';

const EmployeeList = ({ onViewAll, onFacultyClick }) => {

    const [employees, setEmployees] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(0);

    useEffect(() => {
        fetchInstitute();
    }, [])

    const fetchInstitute = async () => {
        try {
            const employeeResponse = await fetch(`${Endpoints.baseURL}/admin/employee/fetch-public-employee/${instId}`);
            if (employeeResponse.ok) {
                const employeeData = await employeeResponse.json();
                setEmployees(employeeData.employees || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const itemsPerSlide = 4;
    const maxPosition = Math.max(0, employees.length - itemsPerSlide);

    const nextSlide = () => {
        setCurrentPosition((prev) => {
            const newPosition = prev + 1;
            return newPosition > maxPosition ? maxPosition : newPosition;
        });
    };

    const prevSlide = () => {
        setCurrentPosition((prev) => {
            const newPosition = prev - 1;
            return newPosition < 0 ? 0 : newPosition;
        });
    };

    const visibleEmployees = employees.slice(currentPosition, currentPosition + itemsPerSlide);

    return (
        <div className="w-full">
            {employees.length > 0 && (
                <section className="py-3 sm:py-3 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10 sm:mb-12">
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 px-2">
                                Our Expert Faculty
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium">
                                Learn from industry professionals with proven expertise and dedication
                            </p>
                        </div>

                        {/* Slider Container */}
                        <div className="relative">
                            {/* Navigation Arrows - Outside Container */}
                            {employees.length > itemsPerSlide && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        disabled={currentPosition === 0}
                                        className={`absolute -left-6 sm:-left-8 top-1/2 transform -translate-y-1/2 z-20 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 p-2 sm:p-1 ${currentPosition === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        disabled={currentPosition >= maxPosition}
                                        className={`absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2 z-20 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 p-2 sm:p-1 ${currentPosition >= maxPosition
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                            }`}
                                    >
                                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </>
                            )}

                            {/* Employee Cards */}
                            <div className="overflow-hidden rounded-xl px-6 sm:px-8">
                                <div
                                    className="flex gap-4 transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${currentPosition * (100 / itemsPerSlide)}%)` }}
                                >
                                    {employees.map((employee, index) => (
                                        <div key={employee.id || index} className="group flex-shrink-0 w-1/4 px-2 sm:px-0">
                                            <div
                                                onClick={() => onFacultyClick && onFacultyClick(employee)}
                                                className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 cursor-pointer hover:-translate-y-2 overflow-hidden group h-full"
                                            >
                                                {/* Background Glow Effect */}
                                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                                                {/* Profile Image */}
                                                <div className="relative mb-4 sm:mb-5 z-10">
                                                    <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-blue-200 via-purple-200 to-blue-200 p-1 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                                                        <div className="w-full rounded-full overflow-hidden bg-white">
                                                            {employee.profile ? (
                                                                <img
                                                                    src={Endpoints.mediaBaseUrl + employee.profile}
                                                                    alt={`${employee.firstName} ${employee.lastName}`}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-4xl">
                                                                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Employee Info */}
                                                <div className="space-y-2.5 z-10 relative">
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                                                        {employee.firstName} {employee.lastName}
                                                    </h3>

                                                    <div className="flex items-center justify-center gap-1.5 text-blue-600 group-hover:text-purple-600 transition-colors duration-300">
                                                        <Briefcase className="w-4 h-4" />
                                                        <p className="font-semibold text-sm line-clamp-1">
                                                            {employee.designation || 'Faculty'}
                                                        </p>
                                                    </div>

                                                    {/* Course Count */}
                                                    {employee.courseIds && employee.courseIds.length > 0 && (
                                                        <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 text-xs font-bold rounded-full mt-2 border border-blue-100 group-hover:border-purple-200 transition-all duration-300">
                                                            <span className="font-semibold">{employee.courseIds.length}</span> Course{employee.courseIds.length > 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scroll Progress Indicator */}
                            {/* {employees.length > itemsPerSlide && (
                                <div className="flex justify-center gap-1.5 mt-8">
                                    <div className="flex-1 max-w-xs h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                                            style={{ width: `${((currentPosition + 1) / (employees.length - itemsPerSlide + 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">
                                        {currentPosition + 1}-{Math.min(currentPosition + itemsPerSlide, employees.length)} of {employees.length}
                                    </span>
                                </div>
                            )} */}
                        </div>

                        {/* View All Button */}
                        {/* {onViewAll && (
                            <div className="text-center mt-10">
                                <button
                                    onClick={onViewAll}
                                    className="px-7 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
                                >
                                    <Users className="w-5 h-5" />
                                    View All Faculty ({employees.length})
                                </button>
                            </div>
                        )} */}
                    </div>
                </section>
            )}
        </div>
    );
};

export default EmployeeList