namespace anotaki_api.Models
{
    public class StoreSettings
    {
        public int Id { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string Neighborhood { get; set; }
        public string Street { get; set; }
        public string Number { get; set; }
        public string? Complement { get; set; }

        public List<WorkingHours> WorkingHours { get; set; } = [];
    }

    public class WorkingHours
    {
        public int Id { get; set; }
        public string DayOfWeek { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public bool IsOpen { get; set; }

        public int StoreSettingsId { get; set; }
        public StoreSettings StoreSettings { get; set; }
    }

    public class WorkingHoursDto
    {
        public string DayOfWeek { get; set; }
        public string? StartTime { get; set; } 
        public string? EndTime { get; set; } 
        public bool IsOpen { get; set; }
    }

    public class StoreSettingsDto
    {
        public int Id { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string Neighborhood { get; set; }
        public string Street { get; set; }
        public string Number { get; set; }
        public string? Complement { get; set; }
        public List<WorkingHoursDto> WorkingHours { get; set; } = [];
    }
}

