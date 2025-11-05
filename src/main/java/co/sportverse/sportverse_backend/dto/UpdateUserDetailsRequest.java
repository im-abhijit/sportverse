package co.sportverse.sportverse_backend.dto;

public class UpdateUserDetailsRequest {
    private String name;          // new user name
    private String mobileNumber;  // lookup key
    private String city;          // new city value

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}



