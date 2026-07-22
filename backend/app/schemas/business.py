from pydantic import BaseModel

class BusinessProfileResponse(BaseModel):
    id: int
    business_name: str
    owner_name: str
    email: str
    phone: str | None = None
    address: str | None = None
    require_pin: bool = False
    has_pin: bool = False
    class Config: from_attributes = True

class BusinessProfileUpdate(BaseModel):
    business_name: str
    owner_name: str
    phone: str | None = None
    address: str | None = None

class PinUpdate(BaseModel):
    pin: str
    confirm_pin: str
    require_pin: bool
