package com.auth.backend.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "claims")
public class Claim {

    @Id
    private String id;
    private String claimId;
    private String submittedAt;
    private String accidentDate;
    private String accidentLocation;
    private Injuries injuries;
    private OtherVehiclesDamaged otherVehiclesDamaged;
    private List<Witness> witnesses;
    private InsuranceCompany insuranceCompany;
    private Driver driver;
    private VisibleDamage visibleDamage;
    private Circumstances circumstances;
    private String sketchImageUrl;
    private Signatures signatures;
    private AccidentPerspective accidentPerspective;

    // ─── Nested Classes ───────────────────────────────────────────

    @Data
    public static class Injuries {
        private boolean anyInjuries;
        private String injuryDetails;
    }

    @Data
    public static class OtherVehiclesDamaged {
        private boolean otherVehicleInvolved;
        private int numberOfVehicles;
    }

    @Data
    public static class Witness {
        private String id;
        private String full_name;
        private String address;
        private boolean isPassangerOfVehicle;
    }

    @Data
    public static class InsuranceCompany {
        private InsuranceDetails vehicleA;
        private InsuranceDetails vehicleB;

        @Data
        public static class InsuranceDetails {
            private String companyName;
            private String contractNumber;
        }
    }

    @Data
    public static class Driver {
        private DriverDetails driverA;
        private DriverDetails driverB;

        @Data
        public static class DriverDetails {
            private String fullName;
            private String address;
            private String dateOfBirth;
            private String license;
        }
    }

    @Data
    public static class VisibleDamage {
        private String vehicleA;
        private String vehicleB;
    }

    @Data
    public static class Circumstances {
        private CircumstancesVehicle vehicleA;
        private CircumstancesVehicle vehicleB;

        @Data
        public static class CircumstancesVehicle {
            private boolean parkedStationary;
            private boolean leavingParkingOrDriveway;
            private boolean enteringParkingOrDriveway;
            private boolean exitingParkingLotOrPrivateLand;
            private boolean enteringRoundabout;
            private boolean alreadyInRoundabout;
            private boolean rearEndSameDirection;
            private boolean changingLanes;
            private boolean overtaking;
            private boolean turningRight;
            private boolean turningLeft;
            private boolean reversing;
            private boolean crossingWrongSideOfRoad;
            private boolean crossingIntersection;
            private boolean ranRedLight;
            private boolean failedToYieldRightOfWay;
            private int totalChecked;
        }
    }

    @Data
    public static class Signatures {
        private SignatureDetails vehicleA;
        private SignatureDetails vehicleB;

        @Data
        public static class SignatureDetails {
            private boolean signed;
            private String signedAt;
            private String svgData;
        }
    }

    @Data
    public static class AccidentPerspective {
        private String driverA;
        private String driverB;
    }
}