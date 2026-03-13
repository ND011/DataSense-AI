from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAnalyzer(ABC):
    """
    Abstract Base Class defining the contract for Domain-Specific Analyzers.
    This implements the Strategy Pattern for dynamic data processing.
    """
    
    @abstractmethod
    def get_kpis(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Dynamically calculate and return Key Performance Indicators based on the dataset stats.
        """
        pass
        
    @abstractmethod
    def get_target_variable(self, schema: Dict[str, Any]) -> str:
        """
        Identify the most important column in the dataset (e.g., 'price' for Finance).
        """
        pass
        
    @abstractmethod
    def interpret_specific_trends(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> str:
        """
        Generate a text summary interpreting the trends specific to this domain.
        """
        pass

    @abstractmethod
    def recommend_domain_charts(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Recommend domain-specific visualizations.
        """
        pass
