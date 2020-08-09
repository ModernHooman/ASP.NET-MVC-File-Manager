var serverPath = '/FileManager/Main/';
var addressBar = $('input[name="current-path"]');
var uploaderWrapper = $('.uploaders');
var bdy = $(document.body);
const updateBtn = $('#update');
const updateIcon = updateBtn.find('> i');
const uploaderSample = $(
    '<div class="uploader">' +
    '    <div class="input-group mb-3">' +
    '        <div class="input-group-prepend">' +
    '            <span class="input-group-text" id="">Upload</span>' +
    '        </div>' +
    '        <div class="custom-file">' +
    '            <input type="file" class="custom-file-input" id="" aria-describedby="">' +
    '            <label class="custom-file-label" for="">' +
    '                <span class="title">Choose File&hellip;</span>' +
    '                <span class="progress">' +
    '                    <span class="progress-bar" role="progressbar"' +
    '                         style="width: 0;"' +
    '                         aria-valuenow="0"' +
    '                         aria-valuemin="0"' +
    '                         aria-valuemax="100">' +
    '                    </span>' +
    '                </span>' +
    '            </label>' +
    '        </div>' +
    '        <div class="input-group-append">' +
    '            <button class="btn btn-outline-danger del-uploader" type="button" id="">' +
    '                <i class="fal fa-times"></i>' +
    '            </button>' +
    '        </div>' +
    '    </div>' +
    '</div>');
var SelectedItemPath;
var SelectedItemId;

function toggle_loader() {
    $('.loader').toggleClass('show');
}

function getCurrentPath() {
    return addressBar.val();
}

function simplifyMimeType(mime) {
    if (mime === 'txt' || mime.includes('text')) {
        return 'txt';
    } else if (mime.includes('javascript')) {
        return 'javascript';
    } else if (mime.includes('mp4')) {
        return 'mp4';
    }
    return 'file';
}

function update() {

    // Show Loader
    toggle_loader();
    // SPIN update icon
    updateIcon.toggleClass('fa-spin');
    $.get(serverPath + 'Update?path=' + getCurrentPath(), function (res) {
        // Hide Loader
        toggle_loader();
        updateIcon.toggleClass('fa-spin');
        if (res) {
            var itemsWrapper = $('#items-wrapper');
            var row = $('<div class="row">');
            res.Items.forEach(function (value, index, array) {
                var src = '';
                var path = value['Path'] + '/' + value['Name'];
                var realPath = path.replace('ROOT', '/File-Repository');
                if (value['MimeType'] !== null && value['MimeType'].includes('image')) {
                    src = value['Path'].replace('ROOT', '/File-Repository') + '/' + value['Name'];
                } else {
                    src = '/Areas/FileManager/Assets/img/file-types/' + (value['IsFolder'] ? 'folder' : simplifyMimeType(value['MimeType'])) + '.png';
                }
                row.append(
                    '<div class="col-lg-2">' +
                    '   <div class="item ' + (value['IsFolder'] ? 'folder' : 'file') + '" ' +
                    '           data-uid="' + value['Id'] + '" ' +
                    '           data-name="' + value['Name'] + '"' +
                    '           data-mime-type="' + value['MimeType'] + '" ' +
                    '           data-path="' + path + '" ' +
                    '           data-CDate="' + new Date(parseInt(value['CDate'].substr(6))).toLocaleString() + '" ' +
                    '           data-MDate="' + new Date(parseInt(value['MDate'].substr(6))).toLocaleString() + '">' +
                    '       <div class="img-wrapper">' +
                    '           <img src="' + src + '" class="img-fluid" alt="">' +
                    '       </div>' +
                    '       <div class="title-wrapper">' + value['Name'] + '</div>' +
                    '       <div class="custom-control custom-checkbox">' +
                    '           <input type="checkbox" class="custom-control-input" id="ch-' + value['Id'] + '">' +
                    '           <label class="custom-control-label" for="ch-' + value['Id'] + '"></label>' +
                    '       </div>' +
                    '       <div class="options">' +
                    '           <a href="javascript:void(0);" class="info"><i class="fal fa-info fa-fw"></i></a>' +
                    '           <a href="javascript:void(0);" class="preview"><i class="fal fa-eye fa-fw"></i></a>' +
                    //'           <a href="' + realPath + '" class="download" download><i class="fal fa-download fa-fw"></i></a>' +
                    '           <a href="javascript:void(0);" class="delete"><i class="fal fa-trash-alt fa-fw"></i></a>' +
                    '           <a href="javascript:void(0);" class="rename"><i class="fal fa-pencil-alt fa-fw"></i></a>' +
                    '       </div>' +
                    '   </div>' +
                    '</div>'
                );
            });
            itemsWrapper.html(row);
        }
    });
}

function create_new_item(name, isFolder) {
    // make a request to create new folder
    toggle_loader();
    $.post(serverPath + 'Create/',
        { Name: name, Path: getCurrentPath(), IsFolder: isFolder }, function (res) {
            toggle_loader();
            if (res) {
                if (res.message) {
                    alertify.notify(res.message, 'success', 5);
                }
                update();
            }
        });
}

function rename_item(id, name, isFolder) {
    // make a request to create new folder
    toggle_loader();
    $.post(serverPath + 'Rename/',
        { Id: id, Name: name, IsFolder: isFolder }, function (res) {
            toggle_loader();
            if (res && res.Status) {
                alertify.notify(res.Message, 'success', 5);
                update();
            } else {
                alertify.notify(res.Message, 'error', 5);
            }
        });
}

function delete_item(id, name, isFolder) {
    // make a request to create new folder
    toggle_loader();
    $.post(serverPath + 'Delete/',
        { Id: id, IsFolder: isFolder },
        function (res) {
            toggle_loader();
            if (res && res.Status) {
                alertify.notify(res.Message, 'success', 5);
                update();
            } else {
                alertify.notify(res.Message, 'error', 5);
            }
        }
    );
}

function upload(inpFile) {
    var progress = inpFile.parents('.uploader').find('.progress-bar');
    var data = new FormData();
    data.append('Path', getCurrentPath());
    data.append('PostedFile', inpFile.prop('files')[0]);

    $.ajax({
        url: serverPath + 'Upload',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                // For handling the progress of the upload
                myXhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        var nowPercent = (100 * e.loaded) / e.total;
                        progress.attr('aria-valuenow', e.loaded);
                        progress.css('width', nowPercent + '%');
                    }
                }, false);
            }
            return myXhr;
        },
        success: function (data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                // Success so call function to process the form
                update();
            } else {
                // Handle errors here
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
        }
    });
}

// Events
$('.new-file').click(function () {
    alertify.prompt('Create A New File', 'File Name (with extension):', 'File01.txt',
        function (evt, value) {
            create_new_item(value, false);
        }, function () {
            alertify.error('Cancel')
        }
    );
});
$('.new-folder').click(function () {
    alertify.prompt('Create A New Folder', 'Folder Name :', 'New Folder',
        function (evt, value) {
            create_new_item(value, true);
        }, function () {
            alertify.error('Cancel')
        }
    );
});
$('#items-wrapper').on('dblclick', '.item', function () {
    var item = $(this);
    if (item.hasClass('folder')) {
        addressBar.val(item.attr('data-path'));
        update();
    }
});
$('.go-back').click(function () {
    var currentAddress = addressBar.val();
    if (currentAddress === 'ROOT') {
        return;
    }
    currentAddress = currentAddress.split('/');
    currentAddress.pop();
    addressBar.val(currentAddress.join('/'));
    update();
});
$('.Select-Item').click(function () {
    parent.img(SelectedItemPath);
});
function token(msg) {
    alert(msg);
    return SelectedItemPath;
}
updateBtn.click(function () {
    update();
});
$('#new-uploader').click(function () {
    uploaderWrapper.append(uploaderSample.clone());
});
bdy.on('dblclick', '.item.file', function (e) {
    var item = $(this);
    SelectedItemPath = item.attr('data-path').replace('ROOT', '/File-Repository');
    SelectedItemId = item.attr('data-uid');
    if (item.attr('data-mime-type').includes('image')) {
        window.open(item.attr('data-path').replace('ROOT', '/File-Repository'), '_blank');
    } else {
        window.open(serverPath + 'Edit/' + item.attr('data-uid'), '_blank');
    }
    document.getElementById("SelectedItemPath").value = SelectedItemId + ' - ' + SelectedItemPath;
});
var x = 0;
bdy.on('click', '.item.file .custom-checkbox', function (e) {
    e.stopPropagation();
    console.log('1-start');
    //disable select 
    if ($('.Select-Item').length) {
        if (x === 0) {
            if ($(this).children(".custom-control-input").is(":checked")) {//true
                $(".Select-Item").css("display", "none"); //alert('true');
                console.log('2-checkbox is checked');

            } else {//false 
                console.log('3-checkbox unchecked');

                var item = $(this).children(".custom-control-input");
                console.log(item);
                var Checkboxid = $("#ch-" + $(this).parent().attr('data-uid') + "").attr('id');
                var itemfileid = $(this).parent();
                var type = $(this).parent().hasClass('folder') ? 'Folder' : 'File';
                console.log(type);
                console.log(Checkboxid);
                console.log($('#' + Checkboxid + '').is(':checked'));
                console.log($('#' + Checkboxid + ''));
                console.log(itemfileid.attr('data-path'));
                $(".custom-control-input").prop("checked", false);
                $("#" + Checkboxid).attr('checked', 'checked');
                if (type === 'File') {
                    $(".Select-Item").css("display", "block");
                } else { $(".Select-Item").css("display", "none"); }

                SelectedItemPath = $(this).parent().attr('data-path').replace('ROOT', '/File-Repository');
                SelectedItemId = $(this).parent().attr('data-uid');
                console.log(SelectedItemId + ' - ' + SelectedItemPath);

            }
            x = 1;
        } else x = 0;
    }

});

bdy.on('click', '.item.file', function (e) {
    var item = $(this);
    var type = item.hasClass('folder') ? 'Folder' : 'File';
    $(".custom-control-input").prop("checked", false);
    $("#ch-" + item.attr('data-uid') + "").prop("checked", true);
    if ($('.Select-Item').length) {
        if (type === 'File') {
            $(".Select-Item").css("display", "block");
        } else { $(".Select-Item").css("display", "none"); }
    }
    SelectedItemPath = item.attr('data-path').replace('ROOT', '/File-Repository');
    SelectedItemId = item.attr('data-uid');
});

$('#upload-modal').on('show.bs.modal', function () {
    uploaderWrapper.html(uploaderSample.clone());
});
bdy.on('change', '.uploader .custom-file > input[type="file"]', function (e) {
    var fileName = e.target.files[0].name;
    $(this).siblings('label').find('.title').html(fileName);
});
bdy.on('click', '.del-uploader', function () {
    $(this).parents('.uploader').slideUp(function () {
        $(this).remove();
    });
});
$('#start-upload').click(function () {
    uploaderWrapper.find('input[type="file"]').each(function (key, value) {
        upload($(this));
    });
});

bdy.on('click', 'a.rename', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    alertify.prompt('Rename File/Directory', 'New Name (with extension):',
        item.find('.title-wrapper').html(),
        function (evt, value) {
            rename_item(item.attr('data-uid'), value, item.hasClass('folder'));
        }, function () {
            alertify.error('Cancel')
        }
    );
});
bdy.on('click', 'a.delete', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    var type = item.hasClass('folder') ? 'Folder' : 'File';
    alertify.confirm('Delete ' + type, 'The ' + type + ' <strong>[' + item.find('.title-wrapper').html() + ']</strong> Will Be Deleted!',
        function (evt, value) {
            delete_item(item.attr('data-uid'), value, item.hasClass('folder'));
        }, function () {
            alertify.error('Cancel')
        }
    );
});
bdy.on('click', 'a.info', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    var type = item.hasClass('folder') ? 'Folder' : 'File';
    alertify.alert('<a href="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class="download" download>' + item.attr('data-name') + '</a> ' + type + ' Information',
        '<dl class="dl-horizontal dt-30">' +
        '   <dt>Id</dt>' +
        '   <dd>' + item.attr('data-uid') + '</dd>' +
        '   <dt>Name</dt>' +
        '   <dd>' + item.attr('data-name') + '</dd>' +
        '   <dt>Mime Type</dt>' +
        '   <dd>' + item.attr('data-mime-type') + '</dd>' +
        '   <dt>Path</dt>' +
        '   <dd>' + item.attr('data-path') + '</dd>' +
        '   <dt>Creation Date</dt>' +
        '   <dd>' + item.attr('data-CDate') + '</dd>' +
        '   <dt>Modification Date</dt>' +
        '   <dd>' + item.attr('data-MDate') + '</dd>' +
        '   <dt>Download</dt>' +
        '   <dd> <a href = "' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class= "download" download > <i class="fal fa-download fa-fw"></i></a> </dd>' +
        '</dl>',
        function (evt, value) {
        }
    );
});
bdy.on('click', 'a.preview', function (e) {
    e.preventDefault();
    var item = $(this).parents('.item');
    var type = item.hasClass('folder') ? 'Folder' : 'File';
    var Filemime = item.attr('data-mime-type');
    if (type === 'File') {
        if (Filemime.includes('video')) {
            alertify.alert('<a href="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class="download" download ><i class="fal fa-download fa-fw"></i>' + item.attr('data-name') + '</a> ' + type + ' preview',
                '<video controls id="myVideo" width="100%" height="100%"><source src="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" type="video/mp4"></video>',
                function (evt, value) {
                }
            );
        }
        else if (Filemime.includes('image')) {
            alertify.alert('<a href="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class="download" download >' + item.attr('data-name') + '</a> ' + type + ' preview',
                '<div><img class="img-thumbnail" ' +
                'src = "' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" ></div>',
                function (evt, value) {
                }
            );

        }
        else if (Filemime.includes('txt')) {
            alertify.alert('<a href="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class="download" download >' + item.attr('data-name') + '</a> ' + type + ' preview',
                '<div><iframe src="/filemanager/main/_Edit/' + item.attr('data-uid') + '" frameborder="0" style="overflow:hidden;min-height:600px; height:100%;width:100%"></iframe> </div> ',
                function (evt, value) {
                }
            );
        }
        else {
            alertify.alert('<a href="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class="download" download >' + item.attr('data-name') + '</a> ' + type + ' preview',
                '<div><a href="' + item.attr('data-path').replace('ROOT', '/File-Repository') + '" class="download" download><i class="fal fa-download fa-fw"></i>Not Suported! click to download</a></div> ',
                function (evt, value) {
                }
            );
        }
    }

});
$(document).ready(function () {
    update();
});