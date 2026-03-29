import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import our new client

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Load tasks from Supabase when the page opens
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: false });
    if (data) setTasks(data);
  }

  async function addTask() {
    if (!title) return;
    const { error } = await supabase
      .from('tasks')
      .insert([{ title, deadline: date, priority, status: 'Incomplete' }]);
    
    if (error) console.log('Error:', error);
    else {
      setTitle(''); // Clear input
      fetchTasks(); // Refresh list
    }
  }
        async function toggleStatus(id, currentStatus) {
        // If status is 'Complete', change to 'Incomplete'. If not, change to 'Complete'.
        const newStatus = currentStatus === 'Complete' ? 'Incomplete' : 'Complete';
  
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
          console.log('Error updating status:', error);
        } else {
            fetchTasks(); // This refreshes the list so you see the change immediately
            }
   }
        async function deleteTask(id) {
        const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id); // This ensures we only delete the specific task you clicked

    if (error) {
      console.log('Error deleting:', error);
    } else {
      fetchTasks(); // Refresh the list so the task disappears
    }
  }

  return (
    <div className="space-y-6">
      {/* UPLOAD SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">📂 Upload New Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. The Title Input */}
          <input 
            type="text" 
            placeholder="Task Title" 
            className="p-2 border rounded-lg"
            value={title} // This tells the box to show what's in the 'title' variable
            onChange={(e) => setTitle(e.target.value)} // This updates the 'title' variable when you type
          />

          {/* 2. The Date Input */}
          <input 
            type="date" 
            className="p-2 border rounded-lg"
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />

          {/* 3. The Priority Select */}
          <select 
            className="p-2 border rounded-lg"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <input type="file" className="md:col-span-2 p-2 border border-dashed rounded-lg" />
          
          {/* 4. The Button */}
          <button 
            onClick={addTask} // This calls the function we wrote to save to Supabase
            className="bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Task Name</th>
              <th className="p-4 font-semibold text-gray-600">Deadline</th>
              <th className="p-4 font-semibold text-gray-600">Priority</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{task.title}</td>
                <td className="p-4 text-gray-500">{task.deadline}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                    {/* 1. NEW MARK DONE BUTTON */}
                     <button 
                    onClick={() => toggleStatus(task.id, task.status)}
                    className={`px-3 py-1 rounded-lg font-bold text-sm transition ${
                    task.status === 'Complete'? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}>
    {task.status === 'Complete' ? '✅ Done' : '⭕ Mark Done'}
  </button>

  {/* 2. YOUR EXISTING DELETE BUTTON */}
  <button 
    onClick={() => deleteTask(task.id)}
    className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg transition"
  >
    Delete
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskManager;