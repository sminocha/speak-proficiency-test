'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Download, Eye } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  status: 'Invited' | 'Completed' | 'In Progress';
  score?: string;
  assessmentUrl?: string;
}

interface AdminPortalProps {
  onStartAssessment: (employeeId: string, employeeName: string) => void;
}

export default function AdminPortal({ onStartAssessment }: AdminPortalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'hana-kim-001',
      name: 'Hana Kim',
      email: 'hana.kim@example.com',
      status: 'Completed',
      score: 'B2',
      assessmentUrl: '/?id=hana-kim-001'
    },
    {
      id: 'david-park-002',
      name: 'David Park',
      email: 'david.park@example.com',
      status: 'Invited',
      assessmentUrl: '/?id=david-park-002'
    }
  ]);

  // Check for updated scores from localStorage
  useEffect(() => {
    const updateEmployeeScores = () => {
      setEmployees(prevEmployees => 
        prevEmployees.map(employee => {
          const storedScore = localStorage.getItem(`employee_${employee.id}_score`);
          if (storedScore && storedScore !== employee.score) {
            return {
              ...employee,
              score: storedScore,
              status: 'Completed' as const
            };
          }
          return employee;
        })
      );
    };

    // Initial check
    updateEmployeeScores();

    // Set up periodic check for score updates
    const interval = setInterval(updateEmployeeScores, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeName.trim() || !employeeEmail.trim()) {
      alert('Please fill in both name and email fields');
      return;
    }

    // Generate a unique ID for the employee
    const employeeId = `${employeeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-3)}`;
    const assessmentUrl = `/?id=${employeeId}`;

    const newEmployee: Employee = {
      id: employeeId,
      name: employeeName.trim(),
      email: employeeEmail.trim(),
      status: 'Invited',
      assessmentUrl
    };

    setEmployees(prev => [...prev, newEmployee]);
    
    // Reset form
    setEmployeeName('');
    setEmployeeEmail('');

    // Show success message with URL
    alert(`Invite sent! Assessment URL: ${window.location.origin}${assessmentUrl}\n\nClick "Open Link" in the table below to test the assessment flow.`);
  };

  const handleOpenAssessment = (employee: Employee) => {
    if (employee.assessmentUrl) {
      // Navigate to the assessment URL in the same tab to trigger proper routing
      window.location.href = employee.assessmentUrl;
    }
  };

  const handleViewCertificate = (employee: Employee) => {
    // Mock certificate view/download
    alert(`Certificate for ${employee.name} would be displayed/downloaded here`);
  };

  const getStatusBadge = (status: Employee['status']) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    
    switch (status) {
      case 'Completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'In Progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Invited':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Speak Certificate - Corporate Admin Portal
          </h1>
          <p className="text-gray-600">
            Manage employee language proficiency assessments and certifications
          </p>
        </div>

        {/* Invite Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Assessment Invite</h2>
          
          <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-2">
                Employee Name
              </label>
              <input
                id="employeeName"
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter employee name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="employeeEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Employee Email
              </label>
              <input
                id="employeeEmail"
                type="email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                placeholder="Enter employee email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Send Assessment Invite
            </button>
          </form>
        </div>

        {/* Invite Status Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Employee Assessment Status</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate / Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(employee.status)}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.score || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {employee.status === 'Completed' ? (
                        <button
                          onClick={() => handleViewCertificate(employee)}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View/Download
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <span className="text-gray-500">[Pending]</span>
                          <button
                            onClick={() => handleOpenAssessment(employee)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Open assessment link"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open Link
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Use the &quot;Open Link&quot; button to experience the assessment flow as an employee</p>
        </div>
      </div>
    </div>
  );
}
