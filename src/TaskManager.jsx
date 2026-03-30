import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  }

  async function addTask() {
    if (!title) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('tasks').insert([{
      user_id: user.id,
      title,
      deadline: date,
      priority,
      status: 'Incomplete'
    }]);

    if (!error) {
      setTitle('');
      setDate('');
      fetchTasks();
    }
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Complete' ? 'Incomplete' : 'Complete';

    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id);

    fetchTasks();
  }

  async function deleteTask(id) {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    fetchTasks();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">📂 Add Task</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            className="p-2 border rounded"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-2 border rounded"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button
            onClick={addTask}
            className="bg-indigo-600 text-white py-2 rounded"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Task</th>
              <th className="p-4">Deadline</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="p-4">{task.title}</td>
                <td className="p-4">{task.deadline}</td>
                <td className="p-4">{task.priority}</td>

                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => toggleStatus(task.id, task.status)}
                    className="bg-green-100 px-3 py-1 rounded"
                  >
                    {task.status === 'Complete' ? '✅ Done' : '⭕ Mark'}
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-100 px-3 py-1 rounded"
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
