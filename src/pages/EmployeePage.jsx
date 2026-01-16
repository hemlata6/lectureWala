import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Endpoints from '../context/endpoints';
import Network from '../context/Network';
import instId from '../context/instituteId';

const EmployeePage = ({ onPageChange }) => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
        window.scrollTo(0, 0);
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${Endpoints.baseURL}admin/employee/fetch-public-employee/${instId}`);
            if (response.ok) {
                const data = await response.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeClick = (employee) => {
        // Navigate to store page with faculty filter
        onPageChange('store', { facultyFilter: employee });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <section className="py-6 sm:py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => onPageChange('home')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Our Expert Faculty
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Meet our experienced and dedicated team of educators
                    </p>
                </div>

                {/* Employees Grid */}
                {employees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {employees.map((employee) => (
                            <div
                                key={employee.id}
                                onClick={() => handleEmployeeClick(employee)}
                                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 cursor-pointer group"
                            >
                                {/* Profile Image */}
                                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                                    {employee.profile ? (
                                        <img
                                            src={Endpoints.mediaBaseUrl + employee.profile}
                                            alt={`${employee.firstName} ${employee.lastName}`}
                                            className="h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                            <div className="text-white font-bold text-4xl">
                                                {employee.firstName?.[0]}{employee.lastName?.[0]}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Employee Info */}
                                <div className="p-4 sm:p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                        {employee.firstName} {employee.lastName}
                                    </h3>

                                    {/* Designation */}
                                    {employee.designation && (
                                        <p className="text-sm font-medium text-blue-600 mb-3">
                                            {employee.designation}
                                        </p>
                                    )}

                                    {/* Email */}
                                    {employee.email && (
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <a
                                                href={`mailto:${employee.email}`}
                                                className="text-sm text-gray-700 hover:text-blue-600 truncate transition-colors duration-200"
                                            >
                                                {employee.email}
                                            </a>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {employee.phone && (
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <a
                                                href={`tel:${employee.phone}`}
                                                className="text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                            >
                                                {employee.phone}
                                            </a>
                                        </div>
                                    )}

                                    {/* Courses Count */}
                                    {employee.courseIds && employee.courseIds.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                                {employee.courseIds.length} Course{employee.courseIds.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No faculty members found.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EmployeePage;
