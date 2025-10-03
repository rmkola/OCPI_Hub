from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum
import hashlib
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="OCPI 2.3.0 Hub",
    description="Open Charge Point Interface Hub for CPOs and eMSPs",
    version="2.3.0"
)

# Create routers
api_router = APIRouter(prefix="/api")
ocpi_router = APIRouter(prefix="/api/ocpi")

security = HTTPBearer()

# OCPI Enums
class RoleType(str, Enum):
    CPO = "CPO"
    EMSP = "EMSP"
    HUB = "HUB"

class InterfaceRole(str, Enum):
    SENDER = "SENDER"
    RECEIVER = "RECEIVER"

class ConnectorType(str, Enum):
    CHADEMO = "CHADEMO"
    DOMESTIC_A = "DOMESTIC_A"
    DOMESTIC_B = "DOMESTIC_B"
    DOMESTIC_C = "DOMESTIC_C"
    DOMESTIC_D = "DOMESTIC_D"
    DOMESTIC_E = "DOMESTIC_E"
    DOMESTIC_F = "DOMESTIC_F"
    DOMESTIC_G = "DOMESTIC_G"
    DOMESTIC_H = "DOMESTIC_H"
    DOMESTIC_I = "DOMESTIC_I"
    DOMESTIC_J = "DOMESTIC_J"
    DOMESTIC_K = "DOMESTIC_K"
    DOMESTIC_L = "DOMESTIC_L"
    IEC_60309_2_single_16 = "IEC_60309_2_single_16"
    IEC_60309_2_three_16 = "IEC_60309_2_three_16"
    IEC_60309_2_three_32 = "IEC_60309_2_three_32"
    IEC_60309_2_three_64 = "IEC_60309_2_three_64"
    IEC_62196_T1 = "IEC_62196_T1"
    IEC_62196_T1_COMBO = "IEC_62196_T1_COMBO"
    IEC_62196_T2 = "IEC_62196_T2"
    IEC_62196_T2_COMBO = "IEC_62196_T2_COMBO"
    IEC_62196_T3A = "IEC_62196_T3A"
    IEC_62196_T3C = "IEC_62196_T3C"
    PANTOGRAPH_BOTTOM_UP = "PANTOGRAPH_BOTTOM_UP"
    PANTOGRAPH_TOP_DOWN = "PANTOGRAPH_TOP_DOWN"
    TESLA_R = "TESLA_R"
    TESLA_S = "TESLA_S"

class SessionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    INVALID = "INVALID"
    PENDING = "PENDING"
    RESERVATION = "RESERVATION"

class TokenType(str, Enum):
    AD_HOC_USER = "AD_HOC_USER"
    APP_USER = "APP_USER"
    OTHER = "OTHER"
    RFID = "RFID"

# OCPI Models
class OCPIResponse(BaseModel):
    data: Optional[Any] = None
    status_code: int
    status_message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Organization Models
class Organization(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    website: Optional[str] = None
    logo: Optional[str] = None
    country_code: str  # ISO 3166-1 alpha-2
    party_id: str      # 3 character party ID
    role: RoleType
    business_details: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrganizationCreate(BaseModel):
    name: str
    website: Optional[str] = None
    logo: Optional[str] = None
    country_code: str
    party_id: str
    role: RoleType
    business_details: Optional[Dict[str, Any]] = None

# Credentials Model
class Credentials(BaseModel):
    token: str
    url: str
    roles: List[Dict[str, Any]]

class CredentialsRole(BaseModel):
    role: RoleType
    business_details: Dict[str, Any]
    party_id: str
    country_code: str

# Location Models
class GeoLocation(BaseModel):
    latitude: str   # decimal degree format
    longitude: str  # decimal degree format

class Connector(BaseModel):
    id: str
    standard: ConnectorType
    format: str
    power_type: str
    max_voltage: int
    max_amperage: int
    max_electric_power: Optional[int] = None
    tariff_ids: Optional[List[str]] = None
    terms_and_conditions: Optional[str] = None
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EVSE(BaseModel):
    uid: str
    evse_id: Optional[str] = None
    status: str
    status_schedule: Optional[List[Dict[str, Any]]] = None
    capabilities: Optional[List[str]] = None
    connectors: List[Connector]
    floor_level: Optional[str] = None
    coordinates: Optional[GeoLocation] = None
    physical_reference: Optional[str] = None
    directions: Optional[List[Dict[str, str]]] = None
    parking_restrictions: Optional[List[str]] = None
    images: Optional[List[Dict[str, Any]]] = None
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Location(BaseModel):
    country_code: str
    party_id: str
    id: str
    publish: bool = True
    publish_allowed_to: Optional[List[Dict[str, str]]] = None
    name: Optional[str] = None
    address: str
    city: str
    postal_code: str
    state: Optional[str] = None
    country: str
    coordinates: GeoLocation
    related_locations: Optional[List[Dict[str, Any]]] = None
    parking_type: Optional[str] = None
    evses: Optional[List[EVSE]] = None
    directions: Optional[List[Dict[str, str]]] = None
    operator: Optional[Dict[str, Any]] = None
    suboperator: Optional[Dict[str, Any]] = None
    owner: Optional[Dict[str, Any]] = None
    facilities: Optional[List[str]] = None
    time_zone: str
    opening_times: Optional[Dict[str, Any]] = None
    charging_when_closed: Optional[bool] = True
    images: Optional[List[Dict[str, Any]]] = None
    energy_mix: Optional[Dict[str, Any]] = None
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Session Models
class Session(BaseModel):
    country_code: str
    party_id: str
    id: str
    start_date_time: datetime
    end_date_time: Optional[datetime] = None
    kwh: float
    cdr_token: Dict[str, Any]
    auth_method: str
    authorization_reference: Optional[str] = None
    location_id: str
    evse_uid: str
    connector_id: str
    meter_id: Optional[str] = None
    currency: str
    charging_periods: Optional[List[Dict[str, Any]]] = None
    total_cost: Optional[Dict[str, Any]] = None
    status: SessionStatus
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Token Models
class Token(BaseModel):
    country_code: str
    party_id: str
    uid: str
    type: TokenType
    contract_id: str
    visual_number: Optional[str] = None
    issuer: str
    group_id: Optional[str] = None
    valid: bool
    whitelist: str
    language: Optional[str] = None
    default_profile_type: Optional[str] = None
    energy_contract: Optional[Dict[str, Any]] = None
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def generate_token():
    return secrets.token_urlsafe(32)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Authentication
async def get_current_organization(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    org = await db.organizations.find_one({"api_token": token})
    if not org:
        raise HTTPException(status_code=401, detail="Invalid token")
    return Organization(**org)

# Organization Management Routes
@api_router.post("/organizations/register", response_model=Organization)
async def register_organization(org_data: OrganizationCreate):
    # Check if party_id + country_code combination already exists
    existing = await db.organizations.find_one({
        "country_code": org_data.country_code,
        "party_id": org_data.party_id
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Organization with this country_code and party_id already exists"
        )
    
    # Generate API token
    api_token = generate_token()
    
    org_dict = org_data.model_dump()
    org_dict["api_token"] = api_token
    org_dict["id"] = str(uuid.uuid4())
    org_dict["created_at"] = datetime.now(timezone.utc)
    org_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.organizations.insert_one(org_dict)
    
    # Return organization without exposing API token
    return Organization(**{k: v for k, v in org_dict.items() if k != "api_token"})

@api_router.get("/organizations", response_model=List[Organization])
async def get_organizations():
    orgs = await db.organizations.find({}, {"api_token": 0}).to_list(1000)
    return [Organization(**org) for org in orgs]

@api_router.get("/organizations/{org_id}", response_model=Organization)
async def get_organization(org_id: str):
    org = await db.organizations.find_one({"id": org_id}, {"api_token": 0})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Organization(**org)

# OCPI Credentials endpoint
@ocpi_router.get("/2.3.0/credentials")
async def get_credentials(current_org: Organization = Depends(get_current_organization)):
    # Return credentials for the requesting organization
    credentials_data = {
        "token": generate_token(),  # Generate new token for the requesting party
        "url": f"https://your-hub-url/api/ocpi/2.3.0",
        "roles": [{
            "role": current_org.role,
            "business_details": current_org.business_details or {},
            "party_id": current_org.party_id,
            "country_code": current_org.country_code
        }]
    }
    
    return OCPIResponse(
        data=credentials_data,
        status_code=1000,
        status_message="Success"
    )

@ocpi_router.post("/2.3.0/credentials")
async def post_credentials(
    credentials: Credentials,
    current_org: Organization = Depends(get_current_organization)
):
    # Store the credentials provided by the client
    # This would typically involve validating the token and storing the endpoint URL
    
    # Update organization with partner credentials
    await db.partner_credentials.insert_one({
        "organization_id": current_org.id,
        "credentials": credentials.model_dump(),
        "created_at": datetime.now(timezone.utc)
    })
    
    return OCPIResponse(
        data=credentials.model_dump(),
        status_code=1000,
        status_message="Success"
    )

# OCPI Locations endpoint
@ocpi_router.get("/2.3.0/locations")
async def get_locations(
    offset: int = 0,
    limit: int = 50,
    current_org: Organization = Depends(get_current_organization)
):
    locations = await db.locations.find().skip(offset).limit(limit).to_list(limit)
    return OCPIResponse(
        data=[Location(**loc) for loc in locations],
        status_code=1000,
        status_message="Success"
    )

@ocpi_router.post("/2.3.0/locations")
async def create_location(
    location: Location,
    current_org: Organization = Depends(get_current_organization)
):
    # Only CPOs can create locations
    if current_org.role != RoleType.CPO:
        raise HTTPException(status_code=403, detail="Only CPOs can create locations")
    
    location_dict = location.model_dump()
    location_dict["owner_org_id"] = current_org.id
    location_dict["created_at"] = datetime.now(timezone.utc)
    
    await db.locations.insert_one(location_dict)
    
    return OCPIResponse(
        data=location,
        status_code=1000,
        status_message="Success"
    )

# OCPI Sessions endpoint
@ocpi_router.get("/2.3.0/sessions")
async def get_sessions(
    offset: int = 0,
    limit: int = 50,
    current_org: Organization = Depends(get_current_organization)
):
    # Filter sessions based on organization role
    query = {}
    if current_org.role == RoleType.CPO:
        query["location_owner_id"] = current_org.id
    elif current_org.role == RoleType.EMSP:
        query["emsp_id"] = current_org.id
    
    sessions = await db.sessions.find(query).skip(offset).limit(limit).to_list(limit)
    return OCPIResponse(
        data=[Session(**session) for session in sessions],
        status_code=1000,
        status_message="Success"
    )

# OCPI Tokens endpoint
@ocpi_router.get("/2.3.0/tokens")
async def get_tokens(
    offset: int = 0,
    limit: int = 50,
    current_org: Organization = Depends(get_current_organization)
):
    # Only eMSPs can access tokens
    if current_org.role != RoleType.EMSP:
        raise HTTPException(status_code=403, detail="Only eMSPs can access tokens")
    
    tokens = await db.tokens.find({"emsp_id": current_org.id}).skip(offset).limit(limit).to_list(limit)
    return OCPIResponse(
        data=[Token(**token) for token in tokens],
        status_code=1000,
        status_message="Success"
    )

# Dashboard endpoints
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    cpo_count = await db.organizations.count_documents({"role": "CPO"})
    emsp_count = await db.organizations.count_documents({"role": "EMSP"})
    location_count = await db.locations.count_documents({})
    session_count = await db.sessions.count_documents({})
    
    return {
        "cpos": cpo_count,
        "emsps": emsp_count,
        "locations": location_count,
        "sessions": session_count
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "OCPI 2.3.0 Hub API"}

# Include routers
app.include_router(api_router)
app.include_router(ocpi_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
