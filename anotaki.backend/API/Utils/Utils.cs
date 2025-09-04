using Microsoft.IdentityModel.Tokens;

namespace anotaki_api.Utils
{
    public static class Utils
    {
        public static string RemoveNonDigits(string text)
        {
            return new string(text.Where(char.IsDigit).ToArray());
        }
    }
}
