var serverPath = '/FileManager/Main/';
var addressBar = $('input[name="current-path"]');

function show_loader() {

}

function hide_loader() {

}

function getCurrentPath() {
    return addressBar.val();
}

function getCurrentFolderId() {
    return addressBar.attr('data-current-id');
}

function update() {
    $.get(serverPath + 'Update?path=' + getCurrentPath(), function (res) {
        if (res) {
            var itemsWrapper = $('#items-wrapper');
            var row = $('<div class="row">');
            res.items.forEach(function (value, index, array) {
                row.append(
                    '<div class="col-lg-2">' +
                    '   <div class="item ' + (value['IsFolder'] ? 'folder' : 'file') + '" data-path="' + value['Path'] + '/' + value['Name'] + '">' +
                    '       <figure>' +
                    '           <img src="/Areas/FileManager/Assets/img/file-types/' + (value['IsFolder'] ? 'folder' : value['MimeType']) + '.png" class="img-fluid" alt="">' +
                    '           <figcaption>' + value['Name'] + '</figcaption>' +
                    '       </figure>' +
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

$(document).ready(function () {
    update();
});