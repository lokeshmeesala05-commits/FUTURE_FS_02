const { Task, User, Lead, Contact, Deal } = require('../models');

const getTasks = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Sales User') {
      query.userId = req.user.id;
    }

    const tasks = await Task.findAll({
      where: query,
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] }
      ],
      order: [['dueDate', 'ASC']]
    });

    // In a real app, we'd use a more sophisticated way to include polymorphic relations.
    // For this simple CRM, we'll manually attach related names if needed or handle it in the frontend.
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'Sales User' && task.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, relatedType, relatedId } = req.body;
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      relatedType,
      relatedId,
      userId: req.user.id,
      status: 'Pending'
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'Sales User' && task.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await task.update(req.body);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'Sales User' && task.userId !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
