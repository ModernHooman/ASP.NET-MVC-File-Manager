using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileManagerApp.Areas.FileManager.Models {
    public class FileItemModel {
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
}