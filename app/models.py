from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    goal = Column(String(50), nullable=False)
    intensity = Column(String(50), nullable=False)
    experience = Column(String(50), nullable=True, default="Beginner")
    preferences = Column(String(255), nullable=True, default="General Fitness")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_data = Column(Text, nullable=False)  # JSON-encoded string containing 7 days
    nutrition_tip = Column(Text, nullable=False)
    recovery_tip = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="plans")
    feedbacks = relationship("Feedback", foreign_keys="Feedback.plan_id", back_populates="plan")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    feedback_text = Column(Text, nullable=False)
    updated_plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    plan = relationship("WorkoutPlan", foreign_keys=[plan_id], back_populates="feedbacks")
    updated_plan = relationship("WorkoutPlan", foreign_keys=[updated_plan_id])
