import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { logout } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/students?page=${currentPage}`);
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  const handleAdd = async (formData) => {
    try {
      await axios.post('/api/students', formData);
      fetchStudents();
      setShowAddForm(false);
    } catch (error) {
      alert('Error adding student');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await axios.put(`/api/students/${editStudent.id}`, formData);
      fetchStudents();
      setEditStudent(null);
    } catch (error) {
      alert('Error updating student');
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>
      
      <div className="students-section">
        <div className="section-header">
          <h2>Students Management</h2>
          <button onClick={() => setShowAddForm(true)}>Add Student</button>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.course}</td>
                <td>{student.enrollmentDate}</td>
                <td>
                  <button onClick={() => setEditStudent(student)}>Edit</button>
                  <button onClick={() => handleDelete(student.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="pagination">
          {Array.from({length: pagination.totalPages}, (_, i) => (
            <button 
              key={i + 1} 
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Add/Edit Forms would go here */}
    </div>
  );
};

export default AdminDashboard;
