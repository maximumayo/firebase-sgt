$(function ($) {

    var submitBtn = $('#add-student-btn'),
        sgtTableElement = $('#student-table'),
        firebaseRef = new Firebase("https://dazzling-fire-2876.firebaseio.com/");

    // Click handler to submit student information
    submitBtn.click(function () {
        var studentName = $('#s-name-input').val(),
            studentCourse = $('#s-course-input').val(),
            studentGrade = $('#s-grade-input').val();

        // Send the values to firebase
        firebaseRef.push({
            name: studentName,
            course: studentCourse,
            grade: studentGrade
        });
        clearInputs();
    });

    // Read operations
    firebaseRef.on("child_added", function (studentSnapShot) {
        updateDOM(studentSnapShot);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    firebaseRef.on("child_changed", function (studentSnapShot) {
        updateDOM(studentSnapShot);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    // Upadate and Edit
    sgtTableElement.on('click', '.edit-btn', function () {
        var student_id = $(this).data('id');
        var studentFirebaseRef = firebaseRef.child(student_id);

        studentFirebaseRef.once('value', function (snapshot) {
            $('#modal-edit-name').val(snapshot.val().name);
            $('#modal-edit-course').val(snapshot.val().course);
            $('#modal-edit-grade').val(snapshot.val().grade);

            $('#student-id').val(student_id);

            console.log("$('#student-id').val(student_id) : ", $('#student-id').val(student_id));

            $("#edit-modal").modal("show");
        });
    });

    function studentEdit(studentFirebaseReference) {
        var newName = $('#modal-edit-name').val(),
            newCourse = $('#modal-edit-course').val(),
            newGrade = $('#modal-edit-grade').val();
        console.log('student updated', 'newName: ', newName, 'newCourse: ', newCourse, 'newGrade: ', newGrade);

        studentFirebaseReference.update({
            name: newName,
            course: newCourse,
            grade: newGrade
        });
    }


    //modal confirm btn
    $("#edit-modal").on('click', '#confirm-edit', function () {
        console.log("im here");
        console.log("('#edit-modal').find('#student-id').val() :", $('#edit-modal').find('#student-id').val());
        var studentFirebaseRef = firebaseRef.child($('#edit-modal').find('#student-id').val());
        studentEdit(studentFirebaseRef)
        $("#edit-modal").modal('hide');
    })

    // delete btn
    sgtTableElement.on('click', '.delete-btn', function () {
        var studentFirebaseRef = firebaseRef.child($(this).data('id'));
        console.log('this on delete-btn is: ' + $(this).data('id'));
        firebaseRef.on('child_removed', function (snapshot) {
            /** Remove the element from the DOM */
            console.log('snapshot.key is: ', snapshot.key());
            var rowId = snapshot.key();
            $('#' + rowId).remove();
        });
        studentFirebaseRef.remove();
    });

    function clearInputs() {
        $('#s-name-input').val('');
        $('#s-course-input').val('');
        $('#s-grade-input').val('');
    }


    function updateDOM(studentSnapShot) {
        var studentObject = studentSnapShot.val();
        var studentObjectId = studentSnapShot.key();
        var studentRow = $("#" + studentObjectId);
        if (studentRow.length > 0) {
            //change current
            studentRow.find(".student-name").text(studentObject.name);
            studentRow.find(".student-course").text(studentObject.course);
            studentRow.find(".student-grade").text(studentObject.grade);
        } else {
            //add new
            var sName = $('<td>', {
                    text: studentObject.name,
                    class: "student-name"
                }),
                sCourse = $('<td>', {
                    text: studentObject.course,
                    class: "student-course"
                }),
                sGrade = $('<td>', {
                    text: studentObject.grade,
                    class: "student-grade"
                }),
            // btn for each row
                sEditBtn = $('<button>', {
                    class: "btn btn-info edit-btn",
                    'data-id': studentObjectId
                }),
                sEditBtnIcon = $('<span>', {
                    class: "glyphicon glyphicon-pencil"
                }),
                sDeleteBtn = $('<button>', {
                    class: "btn btn-danger delete-btn",
                    'data-id': studentObjectId
                }),
                sDeleteBtnIcon = $('<span>', {
                    class: "glyphicon glyphicon-remove"
                });

            var studentRow = $('<tr>', {
                id: studentObjectId
            });
            sEditBtn.append(sEditBtnIcon);
            sDeleteBtn.append(sDeleteBtnIcon);
            studentRow.append(sName, sCourse, sGrade, sEditBtn, sDeleteBtn);
            sgtTableElement.append(studentRow);
        }
    }
});