namespace anotaki_api.Exceptions
{
    public class EmailDuplicatedException : Exception
    {
        public EmailDuplicatedException() : base("Email already exists.") { }
    }

    public class CpfDuplicatedException : Exception
    {
        public CpfDuplicatedException() : base("CPF already exists.") { }
    }

}
