
window.onload=function(){

    var Task;

    Task = (function () {

        //class constructor
        function Task() { }
        //Global Variables
        
        Task.prototype.oTasks = "";
        Task.prototype.aWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        Task.prototype.aMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        

        //Method Definition
        Task.prototype.init = function () {
            var inicialDate = new Date();

            $('#datepicker').datetimepicker({
                showTodayButton: true,
                defaultDate: inicialDate,
                showClose: true,
                minDate: inicialDate
            });
            $("#dateNewTask").html(task.getHtmlDate(inicialDate));
            $("#dateNewTask").click(function(){
                $("#datepicker").data("DateTimePicker").show();
            });
            $("#datepicker").on("dp.change", function (e) {
                var date = new Date($(this).val());
                $("#dateNewTask").html(task.getHtmlDate(date));
            });

            $("#txtTask").focus(function(){
                if($(this).val() == "Write something..."){
                    $(this).val("");
                }
            });
            $("#txtTask").blur(function(){
                if($(this).val() == ""){
                    $(this).val("Write something...");
                }
            });
            $("#btnAddTask").click(function(e){
                e.preventDefault();
                task.addTask();
            })
            
            task.getAllTasks();
        };
        //Get all the tasks from the API 
        Task.prototype.getAllTasks = function (taskId) {
            $.ajax({
                url: 'https://api.agendor.com.br/v1/tasks',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Token f23cc874-d25b-4992-b396-8206e2261202');
                    xhr.setRequestHeader('Content-type', 'application/json');
                },
                success: function(result) {
                    task.oTasks = result;
                    task.refreshTasks(taskId);

                }
            });
        };
        

        //Refresh the tasks from the task.oTasks object
        Task.prototype.refreshTasks = function(taskIdEffect){
            $(".taskList").html("");
            var html = "";
            $.each(task.oTasks, function(i,oObj){
                var dueDate = new Date(oObj.dueDate);
                if(dueDate == "Invalid Date"){
                    return true;
                }
                html = "";
                var chk = "";
                if(oObj.done == 1){
                    chk = "checked";
                }

                html+= "<div class='taskLine' id='taskLine-"+oObj.taskId+"'>";
                    html+= "<div class='userInfo'>";
                        html+= "<div class='userImg'><img src='img/profilePic.png'/></div>";
                        html+= "<div class='userName'>"+oObj.user.name+"</div>";
                    html+= "</div>";
                    html+= "<div class='taskInfo'>";
                        html+= "<div class='taskText'>"+oObj.text+"</div>";
                        html+= "<div class='displayDate' id='dateTask-"+oObj.taskId+"'></div>";
                        html+= "<input id='datepicker-"+oObj.taskId+"' class='datepickerTask' type='text'/>";
                    html+= "</div>";
                    html+= "<div class='chkBox'>"
                        html+= "<div class='checkedEffect "+chk+"' id='chkEffect-" + oObj.taskId + "'><div class='topEffect'></div><div class='bottomEffect'></div><div class='icon-checkmark'></div></div>";
                        html+= "<div class='chk' id='chk-" + oObj.taskId + "' alt='" + chk + "'></div>";
                    html+= "</div>";
                html+= "</div>";
                $(".taskList").append(html);
                if(taskIdEffect == oObj.taskId){
                    $("#taskLine-"+oObj.taskId).height(0);
                    $("#taskLine-"+oObj.taskId ).animate({height: "101px"}, 500);
                }

                $("#datepicker-"+oObj.taskId).datetimepicker({
                    showTodayButton: true,
                    defaultDate: dueDate,
                    showClose: true
                });
                $("#dateTask-"+oObj.taskId).html(task.getHtmlDate(dueDate));

                $("#dateTask-"+oObj.taskId).click(function(){
                    $("#datepicker-"+oObj.taskId).data("DateTimePicker").show();
                });

                //Change dueDate
                $("#datepicker-"+oObj.taskId).on("dp.change", function (e) {
                    var date = new Date($(this).val());
                    task.changeDueDate(oObj, date);
                    $("#dateTask-"+oObj.taskId).html(task.getHtmlDate(date));
                });


                //Done and Undone Task
                $("#chk-" + oObj.taskId+", #chkEffect-" + oObj.taskId).click(function(){
                    if($("#chk-" + oObj.taskId).attr("alt") == "checked"){
                        task.doneTask(oObj, $("#chk-" + oObj.taskId), false);
                    }else{
                        task.doneTask(oObj, $("#chk-" + oObj.taskId), true);
                    }
                })
            });

        }

        

        //Add new task to the list 
        Task.prototype.addTask = function () {
            var datePicker = new Date($("#datepicker").val());
            var date = task.toApiDateFormat(datePicker);
            
            $.ajax({
                url: 'https://api.agendor.com.br/v1/tasks',
                type: "POST",
                dataType: "json",
                data:{
                    "organization": 2639132,
                    "text": $("#txtTask").val(),
                    "dueDate": date, //"2015-10-05T14:59:39.000Z",
                    "assignedUsers": [8731]
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Token f23cc874-d25b-4992-b396-8206e2261202');
                },
                success: function(result) {
                    task.getAllTasks(result.taskId);
                    $("#txtTask").val("");
                    $("#txtTask").blur();
                }
            });
        };

        //Change de deadline date (dueDate) of a task
        Task.prototype.changeDueDate = function (oTask, date) {
            $.ajax({
                url: 'https://api.agendor.com.br/v1/tasks/'+oTask.taskId,
                type: "PUT",
                dataType: "json",
                data:{
                    "text": oTask.text,
                    "dueDate": task.toApiDateFormat(date)
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Token f23cc874-d25b-4992-b396-8206e2261202');
                }
            });
        };
        
        //Set the task as done or undone
        Task.prototype.doneTask = function (oTask, oElement, done) {
            $.ajax({
                url: 'https://api.agendor.com.br/v1/tasks/'+oTask.taskId,
                type: "PUT",
                dataType: "json",
                data:{
                    "text": oTask.text,
                    "done": done,
                    "doneTime": task.toApiDateFormat(new Date())
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Token f23cc874-d25b-4992-b396-8206e2261202');
                },
                success: function(result) {
                    if(done){
                        $(oElement).attr("alt", "checked");
                        $(oElement).prev(".checkedEffect").children(".topEffect, .bottomEffect").animate({height: '50px'}, 300, function(){
                            $(this).next('.icon-checkmark').fadeIn(300);
                        });
                    }else{
                        $(oElement).attr("alt", "");
                        $(oElement).prev('.checkedEffect').children(".icon-checkmark").fadeOut(300, function(){
                            $(this).prev().prev(".topEffect").animate({height: '0px'},300);
                            $(this).prev(".bottomEffect").animate({height: '0px'},300);   
                        });
                    }
                }
            });
        };

        //Utilities
        //Set the date format to 0-12 AM/PM
        Task.prototype.formatAMPM = function (date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        };
        //Retrieve the Html to show the dueDate of tasks
        Task.prototype.getHtmlDate = function (dt) {
            var html = "";
            html+= "<div class='toogleDate'><span class='arrow'></span></div>";
            html+= "<div class='boxTime'>";
                html+= "<div class='weekDay'>"+task.aWeekDays[dt.getDay()]+"</div>";
                html+= "<div class='month'>"+task.aMonths[dt.getMonth()]+" "+dt.getDate()+"</div>";
                html+= "<div class='time'>"+task.formatAMPM(dt)+"</div>";
            html+= "</div>";
            return html;
        };
        //Convert date to api format
        Task.prototype.toApiDateFormat = function (date) {
            var yy = date.getFullYear().toString();
            var mm = (date.getMonth()+1).toString();
            var dd = date.getDate().toString();
            var hh = date.getHours().toString();
            var MM = date.getMinutes().toString();
            var ss = date.getSeconds().toString();

            var dt = yy+"-"+(mm[1]?mm:"0"+mm[0])+"-"+(dd[1]?dd:"0"+dd[0])+"T"+(hh[1]?hh:"0"+hh[0])+":"+(MM[1]?MM:"0"+MM[0])+":"+(ss[1]?ss:"0"+ss[0])+".000";
            return dt;
        }

        return Task;
    })();

    window.task = new Task();
    
    task.init();
}