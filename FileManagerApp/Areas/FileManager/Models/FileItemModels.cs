using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web;
using System.Web.Mvc;

namespace FileManagerApp.Areas.FileManager.Models {

    public class FileItemModel {
        [Display(Name = "Id")]
        public int Id { get; set; }

        [Display(Name = "Name")]
        public string Name { get; set; }

        [Display(Name = "Mime Type")]
        public string MimeType { get; set; }

        [Display(Name = "Path")]
        public string Path { get; set; }

        [Display(Name = "Is This a Folder?")]
        public bool IsFolder { get; set; }

        [Display(Name = "Creation Date")]
        public DateTime CDate { get; set; }

        [Display(Name = "Modification Date")]
        public DateTime MDate { get; set; }

        public int FileId { get; set; }
    }

    public class CreateFileItemModel {
        [Display(Name = "Id")]
        public int? Id { get; set; }

        [Required]
        [Display(Name = "Name")]
        public string Name { get; set; }

        [Required]
        [Display(Name = "Path")]
        public string Path { get; set; }

        [Display(Name = "Is This a Folder?")]
        public bool IsFolder { get; set; }
    }

    public class UploadFileItemModel {
        [Required]
        [Display(Name = "Path")]
        public string Path { get; set; }

        [Required]
        [Display(Name = "File")]
        public HttpPostedFileBase PostedFile { get; set; }
    }

    public class EditFileItemModel {
        [Display(Name = "Id")]
        public int Id { get; set; }

        [Display(Name = "Name")]
        public string Name { get; set; }

        [Display(Name = "Path")]
        public string Path { get; set; }

        [Display(Name = "Content")]
        public string Content { get; set; }

        [Display(Name = "Is This a Folder?")]
        public bool IsFolder { get; set; }

        [Display(Name = "Creation Date")]
        public DateTime CDate { get; set; }

        [Display(Name = "Modification Date")]
        public DateTime MDate { get; set; }
    }

    public class OperationResult {
        public OperationStats Status { get; set; }
        public string Message { get; set; }
        public List<ModelErrorCollection> Errors { get; set; }
        public List<FileItemModel> Items { get; set; }
    }

    public enum OperationStats {
        Error = 0,
        Success = 1
    }

    public static class StringResources {
        public static string SuccessfullyUploaded = "Successfully Uploaded.";
        public static string ItemSuccessfullyUploaded = "{0} Successfully Uploaded.";
        public static string UnknownErrorOccurred = "Unknown Error Occurred!";
        public static string SuccessfullyCreated = "Successfully Created.";
        public static string ItemAlreadyExists = "{0} Already Exists!";
        public static string NotFoundInDatabase = "File or Directory Not Found in Datebase!";
        public static string NotFoundInFileSystem = "File or Directory Not Found in File System!";
        public static string NameChanged = "Name Changed.";
        public static string SuccessfullyDeleted = "Successfully Deleted.";
    }
}