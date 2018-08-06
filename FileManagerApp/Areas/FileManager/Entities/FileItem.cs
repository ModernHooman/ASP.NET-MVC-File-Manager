using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FileManagerApp.Areas.FileManager.Entities {
    public class FileItem {
        [Key]
        [Display(Name = "Id")]
        public int Id { get; set; }

        [Display(Name = "Name")]
        public string Name { get; set; }

        [Display(Name = "Mime Type")]
        public string MimeType { get; set; }

        [Required]
        [Display(Name = "Path")]
        public string Path { get; set; }

        [Display(Name = "Is This a Folder?")]
        public bool IsFolder { get; set; }

        [Display(Name = "Creation Date")]
        public DateTime CDate { get; set; }

        [Display(Name = "Modification Date")]
        public DateTime MDate { get; set; }

        #region Relations

        public virtual ICollection<FileItem> Files { get; set; }
        public virtual FileItem File { get; set; }
        public int? FileId { get; set; }

        #endregion
    }
}