package com.auth.backend.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "contracts")
public class Contract {

    @Id
    private String id;
    @Field("contractNumber")
    private String contractNumber;

    @Field("insuranceCompany")
    private String insuranceCompany;

    @Field("client")
    private String client;

    @Field("type")
    private String type;

    @Field("status")
    private String status;

    @Field("pack")
    private String pack;

    @Field("PaymentMethod")
    private String paymentMethod;

    @Field("StartDate")
    private String startDate;

    @Field("EndDate")
    private String endDate;

    @Field("NetPremium")
    private String netPremium;

    @Field("Fees")
    private String fees;

    @Field("Taxes")
    private String taxes;

    @Field("FG")
    private String fg;

    @Field("TotalPremium")
    private String totalPremium;

    @Field("Brand")
    private String brand;

    @Field("Registration")
    private String registration;

    @Field("MarketValue")
    private String marketValue;

    @Field("DrivingLicenseNumber")
    private String drivingLicenseNumber;
}