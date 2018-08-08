var serverPath = '/FileManager/Main/';
var addressBar = $('input[name="current-path"]');
var uploaderWrapper = $('.uploaders');
var bdy = $(document.body);

function show_loader() {

}

function hide_loader() {

}

function getCurrentPath() {
    return addressBar.val();
}

function simplifyMimeType(mime) {
    if (mime === 'txt' || mime.includes('text')) {
        return 'txt';
    } else if (mime.includes('javascript')) {
        return 'javascript';
    }

    return mime;
}

function update() {
    $.get(serverPath + 'Update?path=' + getCurrentPath(), function (res) {
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
                    '   <div class="item ' + (value['IsFolder'] ? 'folder' : 'file') + '" data-path="' + path + '" data-mime-type="' + value['MimeType'] + '" data-uid="' + value['Id'] + '">' +
                    '       <div class="img-wrapper">' +
                    '           <img src="' + src + '" class="img-fluid" alt="">' +
                    '       </div>' +
                    '       <div class="title-wrapper">' + value['Name'] + '</div>' +
                    '       <div class="custom-control custom-checkbox">' +
                    '           <input type="checkbox" class="custom-control-input" id="ch-' + value['Id'] + '">' +
                    '           <label class="custom-control-label" for="ch-' + value['Id'] + '"></label>' +
                    '       </div>' +
                    '       <div class="options">' +
                    '           <a href="' + realPath + '" class="download" download><i class="fal fa-download fa-fw"></i></a>' +
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
    show_loader();
    $.post(serverPath + 'Create/',
        {Name: name, Path: getCurrentPath(), IsFolder: isFolder}, function (res) {
            hide_loader();
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
    show_loader();
    $.post(serverPath + 'Rename/',
        {Id: id, Name: name, IsFolder: isFolder}, function (res) {
            hide_loader();
            if (res && res.Status) {
                alertify.notify(res.Message, 'success', 5);
                update();
            } else {
                alertify.notify(res.Message, 'error', 5);
            }
        });
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
            }
            else {
                // Handle errors here
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
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
$('#update').click(function () {
    update();
});
$('#new-uploader').click(function () {
    var uploader = uploaderWrapper.find('.uploader').last().clone();
    uploaderWrapper.append(uploader);
});
bdy.on('dblclick', '.item.file', function (e) {
    var item = $(this);
    if (item.attr('data-mime-type').includes('image')) {
        window.open(item.attr('data-path').replace('ROOT', '/File-Repository'), '_blank');
    } else {
        window.open(serverPath + 'Edit/' + item.attr('data-uid'), '_blank');
    }
});
bdy.on('click', '.item.file .custom-checkbox', function (e) {
    e.stopPropagation();
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
$(document).ready(function () {
    update();
});