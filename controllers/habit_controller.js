const Habit = require('../models/habit');
const User = require('../models/user');

// this function will return the current data, which will helpful for getting the range of dates
function getTodayDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const formattedDate = `${month} ${date}`;
    console.log('Generated today\'s date:', formattedDate);
    return formattedDate;
}

// Debug function to check habit data
async function debugHabit(habitId) {
    const habit = await Habit.findById(habitId);
    console.log('Debug - Habit Data:', {
        id: habit._id,
        title: habit.title,
        dates: habit.dates
    });
    return habit;
}

// this function creates a new habit
module.exports.createHabit = async function(req, res) {
    try {
        // console.log("req.body: ", req.body);
        // console.log("req.user: ", req.user);
        let habit = await Habit.findOne({title: req.body.title, user: req.user._id}).populate();
        // console.log(habit);
        if(habit) {
            console.log('Habit exists');
            return res.redirect('/habits/dashboard');
        } else {
            let habit = await Habit.create({
                title: req.body.title,
                desc: req.body.desc,
                time: req.body.time || null,
                user: req.user._id,
                dates: [{date: getTodayDate(), complete: "none"}]
            });

            req.flash('success', 'Habit Created Successfully');
            return res.redirect('/habits/dashboard');
        }
    } catch (error) {
        console.log('Error in habitController/createHabit: ', error);
        return;
    }
}

// this function will change the current status of habit
module.exports.toggleStatus = async function(req, res) {
    try {
        let id = req.query.id;
        let date = req.query.date;
        console.log('Toggling status for habit:', id, 'on date:', date);
        
        // Debug current habit state
        const habit = await debugHabit(id);
        console.log('Current habit state:', habit);

        if(!habit) {
            console.log('Habit not present!');
            return res.redirect('/habits/dashboard');
        }

        // Initialize dates array if it doesn't exist
        if (!habit.dates) {
            habit.dates = [];
        }

        // Find existing date record
        const dateIndex = habit.dates.findIndex(item => {
            console.log('Comparing dates:', item.date, date);
            return item.date === date;
        });
        
        if (dateIndex !== -1) {
            // Update existing date record
            const currentStatus = habit.dates[dateIndex].complete;
            let newStatus;
            
            if (currentStatus === 'y') newStatus = 'n';
            else if (currentStatus === 'n') newStatus = 'x';
            else if (currentStatus === 'x') newStatus = 'y';
            else newStatus = 'y';
            
            habit.dates[dateIndex].complete = newStatus;
            console.log('Updated existing date record:', habit.dates[dateIndex]);
        } else {
            // Add new date record
            const newDate = { date: date, complete: 'y' };
            habit.dates.push(newDate);
            console.log('Added new date record:', newDate);
        }
        
        // Save the habit
        await habit.save();
        
        // Debug final habit state
        const updatedHabit = await debugHabit(id);
        console.log('Updated habit state:', updatedHabit);
        
        return res.redirect('/habits/dashboard');
        
    } catch (error) {
        console.log('Error in habitController/toggleStatus', error);
        return res.render('404', {
            title: "Not Found"
        });
    }
}

// this function removes the habit
module.exports.deleteHabit = async function(req, res) {
    try {
        let id = req.query.id;
        let user = req.user._id;

        await Habit.deleteOne({ _id : id, user: user });
        req.flash('success', 'Habit Deleted Successfully');
        return res.redirect('/habits/dashboard');
        
    } catch (error) {
        console.log('Error in habitController/deleteHabit', error);
        return res.render('404', {
            title: "Not Found"
        })
    }
}

// this function will edit the habit title/desc
module.exports.editHabit = async function(req, res) {
    try {
        let newTitle = req.body.title;
        let newDesc = req.body.desc;
        let id = req.query.id;
        let user = req.user._id;

        let updatedResult = await Habit.findByIdAndUpdate(
            {
                _id: id,
                user: user
            }, {
                title: newTitle,
                desc: newDesc
            }
        );
        // console.log(updatedResult);
        req.flash('success', 'Habit Updated Successfully');
        return res.redirect('/habits/dashboard');
        
    } catch (error) {
        console.log('Error in habitController/editHabit', error);
        return res.render('404', {
            title: "Not Found"
        })
    }
}

// dashboard view
module.exports.dashboard = async function(req, res) {
    try {
        // Get all habits for the current user
        const habits = await Habit.find({ user: req.user._id });
        
        // Calculate weekly progress
        const totalHabits = habits.length;
        const completedHabits = habits.filter(habit => {
            const today = getTodayDate();
            return habit.dates.some(date => date.date === today && date.complete === 'y');
        }).length;
        const progress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

        return res.render('dashboard', {
            title: 'Dashboard',
            habits: habits,
            progress: progress,
            getTodayDate: getTodayDate,
            today: getTodayDate()
        });
    } catch (err) {
        console.log('Error in dashboard:', err);
        return res.redirect('back');
    }
};