// const Post = require('../models/post');
const User = require('../models/user');
const Habit = require('../models/habit');


// this function takes user to home
module.exports.home = async function(req, res) {
    if(req.user){
        // If user is admin, redirect to admin dashboard
        if(req.user.email === 'admin@admin.com'){
            return res.redirect('/admin/dashboard');
        }
        // Otherwise redirect to habits dashboard
        return res.redirect('/habits/dashboard');
    }else{
        return res.render('index', {
            title: 'Habit Tracker - Build Better Habits'
        });
    }
}

// This function is for providing the 7days date, which will be displayed afte the habit is created.
function getOneWeekDate(){
    let months = ["","Jan", "Feb", "March", "Apr", "May", "June", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let dates = [];
    for(let i = 6; i>=0 ; i--){
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i);
        let mm = currentDate.getMonth()+1;
        mm = months[mm];
        let dd = currentDate.getDate();
        if (dd < 10) dd = '0' + dd;
        dates.push(mm +" " +dd);
    }
    return dates;
}


module.exports.notFound = async function(req, res) {
    return res.render('404', {
        title :'Not Found!'
    });
}